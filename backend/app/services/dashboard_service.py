from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories import study_repo, skill_repo, coding_repo, placement_repo


def get_dashboard_data(db: Session, user: User) -> dict:
    # Study stats
    plans = study_repo.get_plans_for_user(db, user.id)
    plan_count = len(plans) if plans else 0
    avg_progress = (
        round(sum((p.progress or 0) for p in plans) / plan_count)
        if plan_count > 0 else 0
    )

    # Pending tasks (first 4 incomplete)
    recent_tasks = []
    if plans:
        for plan in plans:
            if plan.tasks:
                for task in plan.tasks:
                    if not task.completed and len(recent_tasks) < 4:
                        recent_tasks.append({
                            "id": task.id,
                            "text": task.text,
                            "planTitle": plan.title,
                            "completed": False,
                        })

    # Skills
    skills = skill_repo.get_skills_for_user(db, user.id)
    skill_count = len(skills) if skills else 0

    # Coding streak
    coding = coding_repo.get_or_create_stats(db, user.id)
    streak = int(coding.streak or 0) if coding else 0

    # Placements
    placements = placement_repo.get_applications(db, user.id)
    placement_count = len(placements) if placements else 0

    # Resume score (from latest resume if available)
    from app.models.resume import Resume
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    resume_score = int(latest_resume.overall_score or 0) if latest_resume else 0

    # Placement readiness (computed heuristic)
    avg_skill = round(sum((s.score or 0) for s in skills) / skill_count) if skill_count > 0 else 0
    readiness_technical = int(min(100, avg_skill))
    readiness_resume = int(resume_score)
    readiness_interview = int(min(100, max(0, avg_skill - 20)))

    # Compute Pluralsight-style IQ matrices
    skill_scores = {s.subject.lower(): s.score for s in skills} if skills else {}
    
    def get_avg_score(subjects, default_val=50):
        relevant = [skill_scores[sub.lower()] for sub in subjects if sub.lower() in skill_scores]
        if not relevant:
            return default_val
        return round(sum(relevant) / len(relevant))

    role_iqs = {
        "AI Engineer": get_avg_score(["Python", "Machine Learning", "Data Structures", "Mathematics", "Statistics"]),
        "Web Developer": get_avg_score(["React", "JavaScript", "SQL", "Data Structures"]),
        "Backend Developer": get_avg_score(["Python", "SQL", "System Design", "Docker", "Data Structures"]),
        "DevOps Engineer": get_avg_score(["Docker", "System Design", "Python", "SQL"])
    }

    company_iqs = {
        "Google": get_avg_score(["System Design", "Data Structures", "Python", "Machine Learning", "Problem Solving"]),
        "Amazon": get_avg_score(["System Design", "Data Structures", "SQL", "Leadership", "Python"]),
        "Microsoft": get_avg_score(["Data Structures", "System Design", "JavaScript", "Communication"]),
        "Zoho": get_avg_score(["JavaScript", "Data Structures", "SQL", "Problem Solving", "Communication"]),
        "TCS": get_avg_score(["Communication", "JavaScript", "SQL", "Problem Solving"]),
        "Infosys": get_avg_score(["Communication", "Python", "SQL", "Problem Solving"])
    }

    avg_all_skills = round(sum(s.score for s in skills) / len(skills)) if skills else 50
    placement_iq = round((avg_all_skills * 0.40) + (resume_score * 0.30) + (readiness_interview * 0.30))

    if placement_iq >= 85:
        readiness_time = "Ready (1-2 weeks)"
    elif placement_iq >= 70:
        readiness_time = "3-4 weeks"
    elif placement_iq >= 55:
        readiness_time = "2-3 months"
    else:
        readiness_time = "4-6 months"

    return {
        "study_stats": {"count": plan_count, "avg_progress": avg_progress},
        "skill_count": skill_count,
        "coding_streak": streak,
        "placement_count": placement_count,
        "resume_score": resume_score,
        "recent_tasks": recent_tasks,
        "readiness": {
            "technical": readiness_technical,
            "resume": readiness_resume,
            "interview": readiness_interview,
        },
        "role_iqs": role_iqs,
        "company_iqs": company_iqs,
        "placement_iq": placement_iq,
        "readiness_time": readiness_time,
    }

