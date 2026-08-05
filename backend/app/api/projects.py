from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Union
import json
from app.dependencies import get_current_user
from app.models.user import User
from app.services import project_service
from app.repositories import user_repo
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/projects", tags=["Project Recommendation"])


@router.get("/recommendations")
def get_recommendations(
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Get project recommendations.
    Optionally filter by difficulty: Beginner / Intermediate / Advanced.
    Results are sorted by relevance to the user's skills.
    """
    user_skills = user_repo.get_user_skills(current_user)
    return project_service.get_recommendations(skills=user_skills, difficulty=difficulty)


@router.post("/generate")
def generate_recommendations(
    current_user: User = Depends(get_current_user),
):
    """Generate AI-based project recommendations based on user profile."""
    profile = {
        "skills": user_repo.get_user_skills(current_user),
        "role": current_user.role,
    }
    return project_service.generate_ai_recommendations(profile)


@router.get("/saved")
def get_saved_projects(current_user: User = Depends(get_current_user)):
    """Get user's saved/bookmarked projects."""
    try:
        saved_raw = getattr(current_user, "saved_projects_json", "[]") or "[]"
        return json.loads(saved_raw)
    except Exception:
        return []


@router.post("/saved")
def save_projects(
    payload: Union[List[dict], dict],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save/bookmark projects. Can accept a single project dict or a list of projects."""
    try:
        saved_raw = getattr(current_user, "saved_projects_json", "[]") or "[]"
        saved = json.loads(saved_raw)
    except Exception:
        saved = []

    if isinstance(payload, list):
        saved = payload
    else:
        # Append single project if not already present
        if not any(p.get("id") == payload.get("id") for p in saved):
            saved.append(payload)

    current_user.saved_projects_json = json.dumps(saved)
    db.commit()
    return saved


@router.delete("/saved/{project_id}")
def remove_saved_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a project from saved list."""
    try:
        saved_raw = getattr(current_user, "saved_projects_json", "[]") or "[]"
        saved = json.loads(saved_raw)
    except Exception:
        saved = []

    saved = [p for p in saved if str(p.get("id")) != str(project_id)]
    current_user.saved_projects_json = json.dumps(saved)
    db.commit()
    return saved


@router.delete("/saved")
def clear_all_saved_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all saved projects."""
    current_user.saved_projects_json = "[]"
    db.commit()
    return []


@router.get("/{project_id}")
def get_project_detail(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get detailed information about a specific project."""
    # Check saved list first
    try:
        saved_raw = getattr(current_user, "saved_projects_json", "[]") or "[]"
        saved = json.loads(saved_raw)
    except Exception:
        saved = []
    
    project = next((p for p in saved if str(p.get("id")) == str(project_id)), None)
    if not project:
        all_projects = project_service.get_recommendations()
        project = next((p for p in all_projects if str(p.get("id")) == str(project_id)), None)
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project
