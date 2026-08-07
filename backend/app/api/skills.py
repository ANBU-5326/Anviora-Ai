from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.skill import SkillResponse, AssessSkillRequest, SkillAssessmentSaveRequest, SkillAssessmentResponse, SkillAnalysisSaveRequest, SkillAnalysisResponse
from app.models.skill import SkillAssessment, SkillAnalysis
from app.repositories import skill_repo

router = APIRouter(prefix="/skills", tags=["Skill Analyzer"])

RECOMMENDED_RESOURCES = {
    "System Design": [
        {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "type": "Repo"},
        {"title": "Grokking the System Design Interview", "url": "https://www.designgurus.io/course/grokking-the-system-design-interview", "type": "Course"},
    ],
    "DevOps / Cloud": [
        {"title": "Docker Complete Beginner Tutorial", "url": "https://www.youtube.com/watch?v=pTFZFxd4hOI", "type": "Video"},
        {"title": "AWS Cloud Practitioner Certification", "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/", "type": "Certification"},
    ],
    "Algorithms": [
        {"title": "LeetCode 75 Study Plan", "url": "https://leetcode.com/studyplan/leetcode-75/", "type": "Practice"},
        {"title": "NeetCode Algorithm Roadmap", "url": "https://neetcode.io/roadmap", "type": "Interactive"},
    ],
    "Backend Dev": [
        {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Docs"},
        {"title": "PostgreSQL Full Course", "url": "https://www.postgresqltutorial.com/", "type": "Tutorial"},
    ],
    "Frontend Dev": [
        {"title": "React Official Docs", "url": "https://react.dev/", "type": "Docs"},
        {"title": "JavaScript.info — Modern JS Tutorial", "url": "https://javascript.info/", "type": "Tutorial"},
    ],
    "Database Design": [
        {"title": "SQL Zoo (Interactive SQL Practice)", "url": "https://sqlzoo.net/", "type": "Practice"},
        {"title": "Database Design Course — freeCodeCamp", "url": "https://www.freecodecamp.org/news/database-design-course-for-beginners/", "type": "Course"},
    ],
}


# ─── STATIC / SPECIFIC ROUTES MUST COME BEFORE /{user_id} WILDCARD ─────────────

@router.get("", response_model=List[SkillResponse])
def get_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all skill assessments for the current user."""
    skills = skill_repo.get_skills_for_user(db, current_user.id)
    return [
        SkillResponse(
            id=s.id,
            subject=s.subject,
            score=s.score,
            industry_avg=s.industry_avg,
            full_mark=s.full_mark,
            A=s.score,
            B=s.industry_avg
        )
        for s in skills
    ]


@router.post("/assess", response_model=List[SkillResponse])
def assess_skill(
    request: AssessSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a skill score (0–100). Creates it if it doesn't exist."""
    if not (0 <= request.score <= 100):
        raise HTTPException(status_code=400, detail="Score must be between 0 and 100.")
    skill_repo.upsert_skill(db, current_user.id, request.subject, request.score)
    skills = skill_repo.get_skills_for_user(db, current_user.id)
    return [
        SkillResponse(
            id=s.id,
            subject=s.subject,
            score=s.score,
            industry_avg=s.industry_avg,
            full_mark=s.full_mark,
            A=s.score,
            B=s.industry_avg
        )
        for s in skills
    ]


@router.get("/resources")
def get_resources():
    """Return curated learning resources organized by skill topic."""
    return RECOMMENDED_RESOURCES


@router.get("/weak-areas", response_model=List[SkillResponse])
def get_weak_areas(
    threshold: int = 60,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return skills that score below the given threshold (default: 60)."""
    skills = skill_repo.get_skills_for_user(db, current_user.id)
    return [s for s in skills if s.score < threshold]


@router.post("/assessments", response_model=SkillAssessmentResponse)
def save_skill_assessment(
    request: SkillAssessmentSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a full Skill IQ assessment and sync the core user_skills table."""
    skill_repo.upsert_skill(db, current_user.id, request.subject, request.score)

    assessment = SkillAssessment(
        user_id=current_user.id,
        subject=request.subject,
        score=request.score,
        level=request.level,
        benchmark=request.benchmark,
        feedback=request.feedback,
        subtopic_ratings=request.subtopic_ratings,
        what_you_know=request.what_you_know,
        what_is_missing=request.what_is_missing,
        learning_path=request.learning_path
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("/assessments/history", response_model=List[SkillAssessmentResponse])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all historical skill assessments for the current user."""
    history = (
        db.query(SkillAssessment)
        .filter(SkillAssessment.user_id == current_user.id)
        .order_by(SkillAssessment.created_at.desc())
        .all()
    )
    return history


@router.post("/analyses", response_model=SkillAnalysisResponse)
def save_skill_analysis(
    request: SkillAnalysisSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save an AI generated skill analysis to the database."""
    analysis = SkillAnalysis(
        user_id=current_user.id,
        skill_name=request.skill_name,
        score=request.score,
        feedback=request.feedback
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/analyses", response_model=List[SkillAnalysisResponse])
def get_skill_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load all analyzed skills for the current user."""
    return (
        db.query(SkillAnalysis)
        .filter(SkillAnalysis.user_id == current_user.id)
        .order_by(SkillAnalysis.created_at.desc())
        .all()
    )


# ─── 360° SKILL ASSESSMENT ENDPOINTS ────────────────────────────────────────

import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.services.career_service import (
    seed_careers_if_empty, get_or_create_user_360_profile,
    recalculate_360_scores, generate_recommendations_and_gaps,
    sync_user_360_with_ai
)
from app.models.skill import (
    Career, CareerRequiredSkill, UserSkillProfile360,
    SkillAssessment360, SkillLearningRecommendation, SkillProgressHistory
)
from ai.llm.gemini_client import ask_gemini
from ai.skills_ai.evaluator import (
    evaluate_code_quality, evaluate_project_github,
    evaluate_communication_speech, evaluate_soft_skills
)
import json


@router.get("/360/careers")
def get_target_careers(db: Session = Depends(get_db)):
    """Fetch all configurable target careers and benchmark required skills."""
    seed_careers_if_empty(db)
    careers = db.query(Career).filter(Career.is_active == True).all()
    res = []
    for c in careers:
        req_skills = db.query(CareerRequiredSkill).filter(CareerRequiredSkill.career_id == c.id).all()
        res.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "description": c.description,
            "required_skills": [
                {
                    "skill_name": rs.skill_name,
                    "required_level": rs.required_level,
                    "importance_weight": rs.importance_weight
                }
                for rs in req_skills
            ]
        })
    return res


@router.post("/360/select-career")
def select_target_career(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user's selected target career."""
    career_id = request_data.get("career_id")
    if not career_id:
        raise HTTPException(status_code=400, detail="career_id is required")

    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    profile = get_or_create_user_360_profile(db, current_user.id)
    profile.target_career_id = career_id
    db.commit()

    # Regenerate gaps & learning recommendations
    gaps, recs = generate_recommendations_and_gaps(db, current_user.id)
    return {
        "status": "success",
        "selected_career": career.title,
        "gaps_identified": len(gaps)
    }


@router.get("/360/profile")
def get_360_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch complete 360 skill profile, radar chart data, gap analysis, and learning roadmap."""
    seed_careers_if_empty(db)
    profile = get_or_create_user_360_profile(db, current_user.id)

    # Calculate overall weighted score
    profile = recalculate_360_scores(db, current_user.id)

    # Fetch career benchmark if set
    target_career = None
    radar_data = []
    if profile.target_career_id:
        c = db.query(Career).filter(Career.id == profile.target_career_id).first()
        if c:
            req_skills = db.query(CareerRequiredSkill).filter(CareerRequiredSkill.career_id == c.id).all()
            target_career = {
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "skills": [{"skill_name": r.skill_name, "required_level": r.required_level} for r in req_skills]
            }

    # Radar chart breakdown
    category_scores = [
        {"subject": "Programming", "A": int(profile.programming_score), "fullMark": 100},
        {"subject": "AI Knowledge", "A": int(profile.ai_score), "fullMark": 100},
        {"subject": "Database", "A": int(profile.database_score), "fullMark": 100},
        {"subject": "Mathematics", "A": int(profile.math_score), "fullMark": 100},
        {"subject": "Projects", "A": int(profile.projects_score), "fullMark": 100},
        {"subject": "Resume ATS", "A": int(profile.resume_score), "fullMark": 100},
        {"subject": "GitHub Activity", "A": int(profile.github_score), "fullMark": 100},
        {"subject": "Communication", "A": int(profile.communication_score), "fullMark": 100},
        {"subject": "Soft Skills", "A": int(profile.softskills_score), "fullMark": 100},
    ]

    # Gaps & Roadmap
    gaps, recs = generate_recommendations_and_gaps(db, current_user.id)

    roadmap = [
        {
            "id": r.id,
            "skill_name": r.skill_name,
            "gap_score": r.gap_score,
            "action_title": r.action_title,
            "action_type": r.action_type,
            "estimated_hours": r.estimated_hours,
            "is_completed": r.is_completed
        }
        for r in recs
    ]

    # Progress History
    history = db.query(SkillProgressHistory).filter(SkillProgressHistory.user_id == current_user.id).order_by(SkillProgressHistory.recorded_at.asc()).all()

    return {
        "overall_score": profile.overall_score,
        "target_career": target_career,
        "category_scores": category_scores,
        "skill_gaps": gaps,
        "learning_roadmap": roadmap,
        "progress_history": [
            {
                "skill_name": h.skill_name,
                "recorded_score": h.recorded_score,
                "recorded_at": h.recorded_at.strftime("%b %d")
            }
            for h in history
        ]
    }


@router.post("/360/rescan")
async def rescan_user_360_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Triggers real-time re-assessment of all user 360 skills using Gemini AI."""
    seed_careers_if_empty(db)
    profile = await sync_user_360_with_ai(db, current_user.id)
    gaps, recs = generate_recommendations_and_gaps(db, current_user.id)
    return {
        "status": "success",
        "message": "360° Profile re-evaluated with Gemini AI in real time",
        "overall_score": profile.overall_score,
        "gaps_count": len(gaps),
        "roadmap_count": len(recs)
    }


@router.post("/360/assess-category")
async def assess_360_category(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits answers for a multi-category assessment and updates profile scores."""
    category = request_data.get("category", "").lower()
    profile = get_or_create_user_360_profile(db, current_user.id)

    calculated_score = 75.0
    details = {}

    if category == "programming":
        mcq_score = request_data.get("mcq_score", 15) # out of 20
        code_str = request_data.get("code", "")
        code_eval = await evaluate_code_quality("Algorithmic problem", code_str)
        qualitative = code_eval.get("total_score", 75)
        calculated_score = round((mcq_score / 20 * 40) + (qualitative * 0.6), 1)
        profile.programming_score = calculated_score
        details = code_eval

    elif category == "ai":
        mcq_score = request_data.get("mcq_score", 8)
        raw_score = round((mcq_score / 10) * 100, 1)
        try:
            ai_resp = await ask_gemini(
                f"Evaluate candidate AI & ML knowledge score. MCQ Correct: {mcq_score}/10.",
                "You are an AI/ML technical interviewer. Return JSON: {\"score\": <0-100>, \"feedback\": \"<concise evaluation>\"}"
            )
            m = re.search(r'\{.*\}', ai_resp, re.DOTALL)
            eval_data = json.loads(m.group(0)) if m else {}
            calculated_score = float(eval_data.get("score", raw_score))
            details = eval_data
        except Exception:
            calculated_score = raw_score
            details = {"feedback": "Evaluated based on MCQ score."}
        profile.ai_score = calculated_score

    elif category == "database":
        mcq_score = request_data.get("mcq_score", 8)
        raw_score = round((mcq_score / 10) * 100, 1)
        try:
            ai_resp = await ask_gemini(
                f"Evaluate candidate Database & SQL expertise. MCQ Correct: {mcq_score}/10.",
                "You are a Senior DBA. Return JSON: {\"score\": <0-100>, \"feedback\": \"<concise database feedback>\"}"
            )
            m = re.search(r'\{.*\}', ai_resp, re.DOTALL)
            eval_data = json.loads(m.group(0)) if m else {}
            calculated_score = float(eval_data.get("score", raw_score))
            details = eval_data
        except Exception:
            calculated_score = raw_score
            details = {"feedback": "Evaluated based on MCQ score."}
        profile.database_score = calculated_score

    elif category == "mathematics":
        mcq_score = request_data.get("mcq_score", 7)
        raw_score = round((mcq_score / 10) * 100, 1)
        try:
            ai_resp = await ask_gemini(
                f"Evaluate candidate Mathematics & Statistics for AI. MCQ Correct: {mcq_score}/10.",
                "You are a Math & Stats Evaluator. Return JSON: {\"score\": <0-100>, \"feedback\": \"<concise feedback>\"}"
            )
            m = re.search(r'\{.*\}', ai_resp, re.DOTALL)
            eval_data = json.loads(m.group(0)) if m else {}
            calculated_score = float(eval_data.get("score", raw_score))
            details = eval_data
        except Exception:
            calculated_score = raw_score
            details = {"feedback": "Evaluated based on MCQ score."}
        profile.math_score = calculated_score

    elif category == "projects":
        repo_url = request_data.get("repo_url", "https://github.com/user/project")
        tech_stack = request_data.get("tech_stack", "React, Python, FastAPI")
        description = request_data.get("description", "Full stack AI application")
        proj_eval = await evaluate_project_github(repo_url, tech_stack, description)
        calculated_score = float(proj_eval.get("project_score", 80))
        profile.projects_score = calculated_score
        profile.github_score = min(100.0, calculated_score + 5)
        details = proj_eval

    elif category == "communication":
        transcript = request_data.get("transcript", "I am a software engineer passionate about building scalable AI web applications.")
        prompt_topic = request_data.get("topic", "Introduce yourself and explain a major project.")
        comm_eval = await evaluate_communication_speech(transcript, prompt_topic)
        calculated_score = float(comm_eval.get("communication_score", 82))
        profile.communication_score = calculated_score
        details = comm_eval

    elif category == "softskills":
        situational_answers = request_data.get("answers", [])
        soft_eval = await evaluate_soft_skills(situational_answers)
        calculated_score = float(soft_eval.get("soft_skills_score", 85))
        profile.softskills_score = calculated_score
        details = soft_eval

    db.commit()

    # Save detailed assessment log
    log = SkillAssessment360(
        user_id=current_user.id,
        category=category,
        score_achieved=calculated_score,
        details_json=json.dumps(details)
    )
    db.add(log)

    # Recalculate 360 overall profile
    recalculate_360_scores(db, current_user.id)
    gaps, recs = generate_recommendations_and_gaps(db, current_user.id)

    return {
        "status": "success",
        "category": category,
        "score_achieved": calculated_score,
        "overall_score": profile.overall_score,
        "details": details
    }


@router.post("/360/complete-roadmap-task/{task_id}")
def complete_roadmap_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a recommendation task as completed and log historical progress."""
    rec = db.query(SkillLearningRecommendation).filter(
        SkillLearningRecommendation.id == task_id,
        SkillLearningRecommendation.user_id == current_user.id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Task not found")

    rec.is_completed = True
    
    # Increment profile score for that skill
    profile = get_or_create_user_360_profile(db, current_user.id)
    new_val = min(100.0, profile.overall_score + 3.0)
    profile.overall_score = new_val

    # Log progress history
    hist = SkillProgressHistory(
        user_id=current_user.id,
        skill_name=rec.skill_name,
        recorded_score=int(new_val),
        recorded_at=datetime.utcnow()
    )
    db.add(hist)
    db.commit()

    return {
        "status": "completed",
        "task_id": task_id,
        "skill_name": rec.skill_name,
        "updated_overall_score": new_val
    }


# ─── DYNAMIC /{user_id} WILDCARD — must come LAST ────────────────────────────

@router.get("/{user_id}", response_model=List[SkillResponse])
def get_skills_by_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get all skill assessments for a specific user ID (used by dashboard)."""
    skills = skill_repo.get_skills_for_user(db, user_id)
    return [
        SkillResponse(
            id=s.id,
            subject=s.subject,
            score=s.score,
            industry_avg=s.industry_avg,
            full_mark=s.full_mark,
            A=s.score,
            B=s.industry_avg
        )
        for s in skills
    ]


@router.post("/{user_id}", response_model=List[SkillResponse])
def assess_skill_by_user(
    user_id: int,
    request: AssessSkillRequest,
    db: Session = Depends(get_db),
):
    """Update a skill score (0–100) for a specific user ID."""
    if not (0 <= request.score <= 100):
        raise HTTPException(status_code=400, detail="Score must be between 0 and 100.")
    skill_repo.upsert_skill(db, user_id, request.subject, request.score)
    skills = skill_repo.get_skills_for_user(db, user_id)
    return [
        SkillResponse(
            id=s.id,
            subject=s.subject,
            score=s.score,
            industry_avg=s.industry_avg,
            full_mark=s.full_mark,
            A=s.score,
            B=s.industry_avg
        )
        for s in skills
    ]
