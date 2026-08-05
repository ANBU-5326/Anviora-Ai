import json
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, name: str, email: str, password: str, **kwargs) -> User:
    # Generate avatar initials
    avatar = "".join(w[0].upper() for w in name.split()[:2]) or "US"

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        avatar=avatar,
        skills_json="[]",
        **kwargs,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_profile(db: Session, user: User, updates: dict) -> User:
    for key, value in updates.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def update_user_skills(db: Session, user: User, skills: list) -> User:
    user.skills_json = json.dumps(skills)
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user: User, new_password: str) -> User:
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


def get_user_skills(user: User) -> list:
    try:
        return json.loads(user.skills_json or "[]")
    except Exception:
        return []
