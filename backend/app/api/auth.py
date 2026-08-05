from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password
from app.schemas.auth import RegisterRequest, LoginRequest, GoogleLoginRequest, TokenResponse, UserResponse
from app.services import auth_service
from app.repositories import user_repo
from app.dependencies import get_current_user
from app.models.user import User
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account and return a JWT token."""
    result = auth_service.register_user(
        db,
        name=request.name,
        email=request.email,
        password=request.password,
        role=request.role or "Student",
        college=request.college or "",
        department=request.department or "",
        year=request.year or "",
    )
    user = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            bio=user.bio,
            avatar=user.avatar,
            college=user.college,
            department=user.department,
            year=user.year,
            git_nickname=user.git_nickname,
            skills=json.loads(user.skills_json or "[]"),
        ),
    }


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token."""
    result = auth_service.login_user(db, email=request.email, password=request.password)
    user = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            bio=user.bio,
            avatar=user.avatar,
            college=user.college,
            department=user.department,
            year=user.year,
            git_nickname=user.git_nickname,
            skills=json.loads(user.skills_json or "[]"),
        ),
    }


@router.post("/google-login", response_model=TokenResponse)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user via Google login."""
    result = auth_service.login_or_register_google(
        db, email=request.email, name=request.name, avatar=request.avatar
    )
    user = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            bio=user.bio,
            avatar=user.avatar,
            college=user.college,
            department=user.department,
            year=user.year,
            git_nickname=user.git_nickname,
            skills=json.loads(user.skills_json or "[]"),
        ),
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    return UserResponse(
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


@router.post("/logout")
def logout():
    """
    Logout endpoint. For JWT, the client deletes the token.
    This endpoint exists for frontend API consistency.
    """
    return {"message": "Logged out successfully. Please delete your token client-side."}
