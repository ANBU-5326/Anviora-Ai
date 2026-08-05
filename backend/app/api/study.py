from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.study import StudyPlanResponse, StudyPlanCreate, AddTaskRequest, TaskResponse
from app.repositories import study_repo

router = APIRouter(prefix="/study", tags=["Study Planner"])


@router.get("/plans", response_model=List[StudyPlanResponse])
def get_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all study plans for the current user."""
    plans = study_repo.get_plans_for_user(db, current_user.id)
    return [
        StudyPlanResponse(
            id=p.id,
            title=p.title,
            subject=p.subject,
            duration=p.duration,
            progress=p.progress,
            priority=p.priority or "medium",
            exam_date=p.exam_date,
            streak=p.streak or 0,
            burnout_score=p.burnout_score or 10,
            tasks=[TaskResponse(id=t.id, text=t.text, completed=t.completed, difficulty=t.difficulty) for t in p.tasks],
        )
        for p in plans
    ]


@router.post("/plans", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    request: StudyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new study plan."""
    plan = study_repo.create_plan(
        db,
        user_id=current_user.id,
        title=request.title,
        subject=request.subject or "",
        duration=request.duration or "",
        priority=request.priority or "medium",
        exam_date=request.exam_date,
        streak=request.streak or 0,
        burnout_score=request.burnout_score or 10,
    )
    # Add tasks if present
    if request.tasks:
        for t in request.tasks:
            study_repo.add_task_to_plan(db, plan_id=plan.id, text=t.text, difficulty=t.difficulty or "medium")
        db.refresh(plan)

    return StudyPlanResponse(
        id=plan.id,
        title=plan.title,
        subject=plan.subject,
        duration=plan.duration,
        progress=plan.progress,
        priority=plan.priority or "medium",
        exam_date=plan.exam_date,
        streak=plan.streak or 0,
        burnout_score=plan.burnout_score or 10,
        tasks=[TaskResponse(id=t.id, text=t.text, completed=t.completed, difficulty=t.difficulty) for t in plan.tasks]
    )


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a study plan and all its tasks."""
    plan = study_repo.get_plan_by_id(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")
    study_repo.delete_plan(db, plan)


@router.post("/plans/{plan_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def add_task(
    plan_id: int,
    request: AddTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new task to a study plan."""
    plan = study_repo.get_plan_by_id(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")
    task = study_repo.add_task_to_plan(db, plan_id=plan_id, text=request.text)
    return TaskResponse(id=task.id, text=task.text, completed=task.completed)


@router.patch("/plans/{plan_id}/tasks/{task_id}", response_model=List[StudyPlanResponse])
def toggle_task(
    plan_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle a task's completed status and recalculate plan progress."""
    plan = study_repo.get_plan_by_id(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    task = study_repo.get_task(db, task_id, plan_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    study_repo.toggle_task(db, task, plan)

    # Return all plans (matches frontend expectation)
    plans = study_repo.get_plans_for_user(db, current_user.id)
    return [
        StudyPlanResponse(
            id=p.id,
            title=p.title,
            subject=p.subject,
            duration=p.duration,
            progress=p.progress,
            priority=p.priority or "medium",
            exam_date=p.exam_date,
            streak=p.streak or 0,
            burnout_score=p.burnout_score or 10,
            tasks=[TaskResponse(id=t.id, text=t.text, completed=t.completed, difficulty=t.difficulty) for t in p.tasks],
        )
        for p in plans
    ]
