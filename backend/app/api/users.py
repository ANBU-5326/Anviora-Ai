from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import json
import os
from app.core.database import get_db
from app.core.security import verify_password
from app.schemas.user import ProfileUpdateRequest, SkillsUpdateRequest, ChangePasswordRequest, UserProfileResponse, DashboardStatsResponse
from app.repositories import user_repo
from app.services import auth_service, dashboard_service
from app.dependencies import get_current_user
from app.models.user import User
from app.config.settings import settings

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the full profile of the authenticated user."""
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        bio=current_user.bio,
        avatar=current_user.avatar,
        college=current_user.college,
        department=current_user.department,
        year=current_user.year,
        git_nickname=current_user.git_nickname,
        skills=json.loads(current_user.skills_json or "[]"),
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile fields (name, bio, role, college, etc.)."""
    updates = request.model_dump(exclude_none=True)
    if "skills" in updates:
        skills = updates.pop("skills")
        user_repo.update_user_skills(db, current_user, skills)
    updated_user = user_repo.update_user_profile(db, current_user, updates)
    return UserProfileResponse(
        id=updated_user.id,
        name=updated_user.name,
        email=updated_user.email,
        role=updated_user.role,
        bio=updated_user.bio,
        avatar=updated_user.avatar,
        college=updated_user.college,
        department=updated_user.department,
        year=updated_user.year,
        git_nickname=updated_user.git_nickname,
        skills=json.loads(updated_user.skills_json or "[]"),
    )


@router.put("/skills")
def update_skills(
    request: SkillsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Replace the user's skills list."""
    user_repo.update_user_skills(db, current_user, request.skills)
    return {"skills": request.skills, "message": "Skills updated successfully"}


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the user's password after verifying the old one."""
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters.",
        )
    user_repo.update_user_password(db, current_user, request.new_password)
    return {"message": "Password changed successfully."}


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete the authenticated user's account."""
    user_repo.delete_user(db, current_user)
    return {"message": "Account deleted successfully."}


@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard stats matching frontend expectation."""
    data = dashboard_service.get_dashboard_data(db, current_user)
    return DashboardStatsResponse(
        study_count=data["study_stats"]["count"],
        avg_progress=data["study_stats"]["avg_progress"],
        skill_count=data["skill_count"],
        coding_streak=data["coding_streak"],
        placement_count=data["placement_count"],
        resume_score=data["resume_score"],
        readiness_technical=data["readiness"]["technical"],
        readiness_resume=data["readiness"]["resume"],
        readiness_interview=data["readiness"]["interview"],
        role_iqs=data.get("role_iqs"),
        company_iqs=data.get("company_iqs"),
        placement_iq=data.get("placement_iq"),
        readiness_time=data.get("readiness_time"),
    )


@router.post("/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload user avatar and return updated avatar URL."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(avatar.filename)[1] if avatar.filename else ".jpg"
    filename = f"avatar_{current_user.id}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    content = await avatar.read()
    with open(filepath, "wb") as f:
        f.write(content)
        
    avatar_url = f"/static/uploads/{filename}"
    user_repo.update_user_profile(db, current_user, {"avatar": avatar_url})
    
    return {"avatar": avatar_url, "message": "Avatar uploaded successfully."}
