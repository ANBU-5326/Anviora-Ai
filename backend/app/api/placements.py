from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.placement import (
    PlacementApplicationCreate,
    PlacementApplicationResponse,
    UpdateStatusRequest,
    PlacementUpdateRequest,
    PlacementAdviceSaveRequest,
    PlacementAdviceResponse,
)
from app.models.placement import PlacementAdvice
from app.repositories import placement_repo

router = APIRouter(prefix="/placements", tags=["Placement Tracker"])

@router.get("", response_model=List[PlacementApplicationResponse])
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return placement_repo.get_applications(db, current_user.id)

@router.post("", response_model=PlacementApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    request: PlacementApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return placement_repo.create_application(
        db,
        user_id=current_user.id,
        company=request.company,
        role=request.role,
        salary=request.salary,
        notes=request.notes,
    )

@router.put("/{app_id}/status", response_model=PlacementApplicationResponse)
def update_status(
    app_id: int,
    request: UpdateStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = placement_repo.get_application_by_id(db, app_id, current_user.id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return placement_repo.update_application(db, app, {"status": request.status})

@router.put("/{app_id}", response_model=PlacementApplicationResponse)
def update_application(
    app_id: int,
    request: PlacementUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = placement_repo.get_application_by_id(db, app_id, current_user.id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    updates = request.model_dump(exclude_none=True)
    return placement_repo.update_application(db, app, updates)

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = placement_repo.get_application_by_id(db, app_id, current_user.id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    placement_repo.delete_application(db, app)
    return None


@router.post("/advice", response_model=PlacementAdviceResponse)
def save_placement_advice(
    request: PlacementAdviceSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save AI generated placement advice to the database."""
    advice = PlacementAdvice(
        user_id=current_user.id,
        content=request.content
    )
    db.add(advice)
    db.commit()
    db.refresh(advice)
    
    # Return serializable format
    return PlacementAdviceResponse(
        id=advice.id,
        user_id=advice.user_id,
        content=advice.content,
        created_at=advice.created_at.isoformat()
    )


@router.get("/advice", response_model=List[PlacementAdviceResponse])
def get_placement_advice_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load all saved placement advice for the current user."""
    advices = (
        db.query(PlacementAdvice)
        .filter(PlacementAdvice.user_id == current_user.id)
        .order_by(PlacementAdvice.created_at.desc())
        .all()
    )
    return [
        PlacementAdviceResponse(
            id=a.id,
            user_id=a.user_id,
            content=a.content,
            created_at=a.created_at.isoformat()
        )
        for a in advices
    ]

