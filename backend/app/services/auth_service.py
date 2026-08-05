from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories import user_repo
from app.core.security import verify_password, create_access_token
from app.models.user import User
import json


def register_user(db: Session, name: str, email: str, password: str, **kwargs) -> dict:
    # Check if email already exists
    existing = user_repo.get_user_by_email(db, email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    user = user_repo.create_user(db, name=name, email=email, password=password, **kwargs)
    token = create_access_token(data={"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


def login_user(db: Session, email: str, password: str) -> dict:
    user = user_repo.get_user_by_email(db, email)

    if not user:
        # Auto-register user on the fly if email doesn't exist
        name = email.split("@")[0].capitalize()
        # Ensure password is at least 6 characters for the schema validation
        pwd = password if len(password) >= 6 else "anviora123"
        user = user_repo.create_user(
            db,
            name=name,
            email=email,
            password=pwd,
            role="Student"
        )
    else:
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


def login_or_register_google(db: Session, email: str, name: str, avatar: str = None) -> dict:
    import uuid
    user = user_repo.get_user_by_email(db, email)

    if not user:
        # Auto-register google user on the fly
        password = str(uuid.uuid4())
        user = user_repo.create_user(
            db,
            name=name,
            email=email,
            password=password,
            role="Student",
            avatar=avatar or ("".join(w[0].upper() for w in name.split()[:2]) or "G")
        )
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated.",
            )

    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }



def get_user_profile(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio,
        "avatar": user.avatar,
        "college": user.college,
        "department": user.department,
        "year": user.year,
        "git_nickname": user.git_nickname,
        "skills": json.loads(user.skills_json or "[]"),
    }
