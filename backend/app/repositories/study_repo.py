from sqlalchemy.orm import Session
from app.models.study import StudyPlan, StudyTask
from typing import List, Optional


def get_plans_for_user(db: Session, user_id: int) -> List[StudyPlan]:
    return db.query(StudyPlan).filter(StudyPlan.user_id == user_id).order_by(StudyPlan.id.desc()).all()


def get_plan_by_id(db: Session, plan_id: int, user_id: int) -> Optional[StudyPlan]:
    return db.query(StudyPlan).filter(
        StudyPlan.id == plan_id, StudyPlan.user_id == user_id
    ).first()


def create_plan(db: Session, user_id: int, title: str, subject: str = "", duration: str = "", priority: str = "medium", exam_date: str = None, streak: int = 0, burnout_score: int = 10) -> StudyPlan:
    plan = StudyPlan(
        user_id=user_id,
        title=title,
        subject=subject or "",
        duration=duration or "",
        progress=0,
        priority=priority or "medium",
        exam_date=exam_date,
        streak=streak or 0,
        burnout_score=burnout_score or 10
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def delete_plan(db: Session, plan: StudyPlan) -> None:
    db.delete(plan)
    db.commit()


def add_task_to_plan(db: Session, plan_id: int, text: str, difficulty: str = "medium") -> StudyTask:
    task = StudyTask(plan_id=plan_id, text=text, difficulty=difficulty or "medium", completed=False)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int, plan_id: int) -> Optional[StudyTask]:
    return db.query(StudyTask).filter(
        StudyTask.id == task_id, StudyTask.plan_id == plan_id
    ).first()


def toggle_task(db: Session, task: StudyTask, plan: StudyPlan) -> StudyTask:
    task.completed = not task.completed
    db.commit()

    # Recalculate plan progress
    total = len(plan.tasks)
    completed = sum(1 for t in plan.tasks if t.completed)
    plan.progress = round((completed / total) * 100) if total > 0 else 0
    db.commit()
    db.refresh(task)
    db.refresh(plan)
    return task
