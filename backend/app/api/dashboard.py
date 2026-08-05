from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated dashboard data for the authenticated user:
    study stats, skills count, coding streak, placement count,
    resume score, recent tasks, and placement readiness indicators.
    """
    return dashboard_service.get_dashboard_data(db, current_user)
