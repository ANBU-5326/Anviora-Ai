from sqlalchemy.orm import Session
from app.models.placement import PlacementApplication
from typing import List, Optional
from datetime import date


def get_applications(db: Session, user_id: int) -> List[PlacementApplication]:
    return (
        db.query(PlacementApplication)
        .filter(PlacementApplication.user_id == user_id)
        .order_by(PlacementApplication.created_at.desc())
        .all()
    )


def get_application_by_id(db: Session, app_id: int, user_id: int) -> Optional[PlacementApplication]:
    return db.query(PlacementApplication).filter(
        PlacementApplication.id == app_id,
        PlacementApplication.user_id == user_id,
    ).first()


def create_application(db: Session, user_id: int, **kwargs) -> PlacementApplication:
    app = PlacementApplication(
        user_id=user_id,
        date_applied=date.today().isoformat(),
        **kwargs,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def update_application(db: Session, app: PlacementApplication, updates: dict) -> PlacementApplication:
    for key, value in updates.items():
        if value is not None:
            setattr(app, key, value)
    db.commit()
    db.refresh(app)
    return app


def delete_application(db: Session, app: PlacementApplication) -> None:
    db.delete(app)
    db.commit()
