from sqlalchemy.orm import Session
from app.models.skill import UserSkill
from typing import List, Optional


DEFAULT_SKILLS = [
    # Technical Skills
    {"subject": "Python",           "score": 82, "industry_avg": 90},
    {"subject": "JavaScript",       "score": 74, "industry_avg": 85},
    {"subject": "React",            "score": 70, "industry_avg": 85},
    {"subject": "SQL",              "score": 65, "industry_avg": 80},
    {"subject": "System Design",    "score": 40, "industry_avg": 85},
    {"subject": "Docker",           "score": 35, "industry_avg": 75},
    {"subject": "Machine Learning", "score": 55, "industry_avg": 80},
    {"subject": "Data Structures",  "score": 72, "industry_avg": 90},
    # Soft Skills
    {"subject": "Communication",    "score": 68, "industry_avg": 80},
    {"subject": "Problem Solving",  "score": 80, "industry_avg": 90},
    {"subject": "Leadership",       "score": 55, "industry_avg": 75},
    {"subject": "Teamwork",         "score": 75, "industry_avg": 80},
    {"subject": "Presentation",     "score": 50, "industry_avg": 70},
    # Academic Skills
    {"subject": "Mathematics",      "score": 78, "industry_avg": 80},
    {"subject": "Statistics",       "score": 60, "industry_avg": 75},
    {"subject": "Research",         "score": 55, "industry_avg": 70},
    {"subject": "Tech Writing",     "score": 48, "industry_avg": 65},
]


def get_skills_for_user(db: Session, user_id: int) -> List[UserSkill]:
    return db.query(UserSkill).filter(UserSkill.user_id == user_id).all()


def seed_default_skills(db: Session, user_id: int) -> List[UserSkill]:
    skills = []
    for s in DEFAULT_SKILLS:
        skill = UserSkill(user_id=user_id, **s)
        db.add(skill)
        skills.append(skill)
    db.commit()
    for s in skills:
        db.refresh(s)
    return skills


def get_skill_by_subject(db: Session, user_id: int, subject: str) -> Optional[UserSkill]:
    return db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.subject.ilike(subject)
    ).first()


def upsert_skill(db: Session, user_id: int, subject: str, score: int) -> UserSkill:
    skill = get_skill_by_subject(db, user_id, subject)
    if skill:
        skill.score = max(0, min(100, score))
        db.commit()
        db.refresh(skill)
    else:
        skill = UserSkill(user_id=user_id, subject=subject, score=score)
        db.add(skill)
        db.commit()
        db.refresh(skill)
    return skill
