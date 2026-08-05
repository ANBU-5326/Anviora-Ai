import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime
import json

# Ensure project root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.models.skill import (
    Career, CareerRequiredSkill, UserSkillProfile360,
    SkillAssessment360, SkillLearningRecommendation, SkillProgressHistory
)
from app.models.user import User
from ai.llm.gemini_client import ask_gemini

DEFAULT_CAREER_SEED = [
    {
        "title": "AI Engineer",
        "category": "Artificial Intelligence",
        "description": "Specializes in building ML models, deep neural networks, RAG pipelines, and LLM applications.",
        "skills": [
            ("Python", 95, 1.2),
            ("Machine Learning", 90, 1.2),
            ("Deep Learning & PyTorch", 85, 1.1),
            ("SQL & Data Pipelines", 80, 1.0),
            ("Mathematics & Calculus", 85, 1.0),
            ("Statistics & Probability", 80, 1.0),
            ("Git & Version Control", 75, 0.9),
            ("Docker & Containerization", 70, 0.8),
            ("Linux System Administration", 70, 0.8),
            ("LLMs & RAG Architectures", 80, 1.1)
        ]
    },
    {
        "title": "Full Stack Developer",
        "category": "Software Engineering",
        "description": "Builds end-to-end web applications, reactive user interfaces, APIs, and scalable backends.",
        "skills": [
            ("JavaScript / TypeScript", 90, 1.2),
            ("React & Frontend Architecture", 85, 1.1),
            ("Node.js / Python Backend", 85, 1.1),
            ("SQL & NoSQL Databases", 85, 1.0),
            ("HTML5 / CSS3 & UI Design", 90, 1.0),
            ("REST APIs & GraphQL", 90, 1.1),
            ("Git & Version Control", 80, 0.9),
            ("Docker & Deployment", 75, 0.9),
            ("System Design", 75, 1.0)
        ]
    },
    {
        "title": "Cyber Security Analyst",
        "category": "Cybersecurity",
        "description": "Monitors, detects, and prevents security incidents, audits code vulnerability, and defends networks.",
        "skills": [
            ("Network Security & Firewalls", 90, 1.2),
            ("Linux System Administration", 85, 1.1),
            ("Python / Bash Scripting", 80, 1.0),
            ("Ethical Hacking & PenTesting", 85, 1.2),
            ("Cryptography", 80, 1.0),
            ("SIEM & Log Monitoring", 75, 0.9),
            ("Risk Assessment & Audit", 80, 1.0)
        ]
    },
    {
        "title": "Data Scientist",
        "category": "Data & Analytics",
        "description": "Transforms raw data into strategic insights using statistical analysis, predictive modeling, and viz.",
        "skills": [
            ("Python & Pandas/NumPy", 90, 1.2),
            ("SQL & Data Warehousing", 90, 1.2),
            ("Statistics & Hypothesis Testing", 90, 1.2),
            ("Machine Learning Algorithms", 85, 1.1),
            ("Data Visualization", 85, 1.0),
            ("Mathematics & Linear Algebra", 80, 1.0),
            ("Big Data Technologies", 75, 0.9)
        ]
    },
    {
        "title": "DevOps & Cloud Engineer",
        "category": "Cloud & Operations",
        "description": "Automates CI/CD deployment pipelines, manages cloud infrastructure, and enforces container security.",
        "skills": [
            ("Linux System Administration", 90, 1.2),
            ("Docker & Containerization", 90, 1.2),
            ("Kubernetes Orchestration", 85, 1.1),
            ("AWS / Cloud Infrastructure", 85, 1.1),
            ("CI/CD Pipeline Automation", 85, 1.1),
            ("Python / Bash Automation", 80, 1.0),
            ("Terraform & Infrastructure as Code", 75, 0.9)
        ]
    }
]


def seed_careers_if_empty(db: Session):
    """Seed default careers and benchmarks if none exist."""
    existing_count = db.query(Career).count()
    if existing_count > 0:
        return

    for cdata in DEFAULT_CAREER_SEED:
        career = Career(
            title=cdata["title"],
            category=cdata["category"],
            description=cdata["description"],
            is_active=True
        )
        db.add(career)
        db.flush()

        for skill_name, level, weight in cdata["skills"]:
            req_skill = CareerRequiredSkill(
                career_id=career.id,
                skill_name=skill_name,
                required_level=level,
                importance_weight=weight
            )
            db.add(req_skill)

    db.commit()


def get_or_create_user_360_profile(db: Session, user_id: int) -> UserSkillProfile360:
    """Fetch or initialize the user's 360 profile."""
    profile = db.query(UserSkillProfile360).filter(UserSkillProfile360.user_id == user_id).first()
    if not profile:
        # Default target career = AI Engineer (or first available career)
        default_career = db.query(Career).first()
        career_id = default_career.id if default_career else None
        
        profile = UserSkillProfile360(
            user_id=user_id,
            target_career_id=career_id,
            overall_score=45.0,
            programming_score=50.0,
            ai_score=40.0,
            database_score=45.0,
            math_score=40.0,
            projects_score=50.0,
            resume_score=45.0,
            github_score=40.0,
            communication_score=50.0,
            softskills_score=55.0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def recalculate_360_scores(db: Session, user_id: int):
    """Recalculates weighted 360 overall score."""
    profile = get_or_create_user_360_profile(db, user_id)

    # Weights defined in requirement
    # Programming: 30%, AI: 20%, Projects: 15%, Resume: 10%, GitHub: 10%, Comm: 10%, SoftSkills: 5%
    # Note: DB & Math are factored into Programming & AI
    weights = {
        "programming": 0.30,
        "ai": 0.20,
        "projects": 0.15,
        "resume": 0.10,
        "github": 0.10,
        "communication": 0.10,
        "softskills": 0.05
    }

    weighted_score = (
        (profile.programming_score * weights["programming"]) +
        (profile.ai_score * weights["ai"]) +
        (profile.projects_score * weights["projects"]) +
        (profile.resume_score * weights["resume"]) +
        (profile.github_score * weights["github"]) +
        (profile.communication_score * weights["communication"]) +
        (profile.softskills_score * weights["softskills"])
    )

    profile.overall_score = round(min(100.0, max(0.0, weighted_score)), 1)
    db.commit()
    db.refresh(profile)
    return profile


def generate_recommendations_and_gaps(db: Session, user_id: int):
    """Detects skill gaps against chosen career benchmark and populates learning roadmap."""
    profile = get_or_create_user_360_profile(db, user_id)
    if not profile.target_career_id:
        return [], []

    career = db.query(Career).filter(Career.id == profile.target_career_id).first()
    if not career:
        return [], []

    req_skills = db.query(CareerRequiredSkill).filter(CareerRequiredSkill.career_id == career.id).all()

    # Map category scores to relevant skills
    cat_map = {
        "Python": profile.programming_score,
        "JavaScript / TypeScript": profile.programming_score,
        "SQL": profile.database_score,
        "SQL & Data Pipelines": profile.database_score,
        "SQL & Databases": profile.database_score,
        "Machine Learning": profile.ai_score,
        "Deep Learning": profile.ai_score,
        "Deep Learning & PyTorch": profile.ai_score,
        "LLMs & RAG Architectures": profile.ai_score,
        "Mathematics": profile.math_score,
        "Mathematics & Calculus": profile.math_score,
        "Statistics & Probability": profile.math_score,
        "Git": profile.github_score,
        "Git & Version Control": profile.github_score,
        "Docker": profile.projects_score,
        "Docker & Containerization": profile.projects_score,
        "Linux": profile.programming_score,
        "Linux System Administration": profile.programming_score,
    }

    gaps = []
    # Clear existing non-completed recommendations for fresh generation
    db.query(SkillLearningRecommendation).filter(
        SkillLearningRecommendation.user_id == user_id,
        SkillLearningRecommendation.is_completed == False
    ).delete()

    for rs in req_skills:
        user_actual = cat_map.get(rs.skill_name, profile.overall_score)
        gap_val = int(rs.required_level - user_actual)
        
        if gap_val > 0:
            gaps.append({
                "skill_name": rs.skill_name,
                "required_level": rs.required_level,
                "actual_level": int(user_actual),
                "gap": gap_val
            })

            # Create specific actionable roadmap items
            rec1 = SkillLearningRecommendation(
                user_id=user_id,
                skill_name=rs.skill_name,
                gap_score=gap_val,
                action_title=f"Complete {rs.skill_name} Core Masterclass",
                action_type="course",
                estimated_hours=max(2, gap_val // 5),
                is_completed=False
            )
            rec2 = SkillLearningRecommendation(
                user_id=user_id,
                skill_name=rs.skill_name,
                gap_score=gap_val,
                action_title=f"Build {rs.skill_name} Portfolio Project",
                action_type="project",
                estimated_hours=max(3, gap_val // 4),
                is_completed=False
            )
            db.add(rec1)
            db.add(rec2)

    db.commit()
    
    # Sort gaps highest to lowest
    gaps.sort(key=lambda x: x["gap"], reverse=True)
    recs = db.query(SkillLearningRecommendation).filter(SkillLearningRecommendation.user_id == user_id).all()
    return gaps, recs
