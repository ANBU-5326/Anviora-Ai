from sqlalchemy.orm import Session
from app.models.chat import ChatMessage
from typing import List


def save_message(db: Session, user_id: int, session_id: str, sender: str, text: str) -> ChatMessage:
    msg = ChatMessage(user_id=user_id, session_id=session_id, sender=sender, text=text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_session_messages(db: Session, user_id: int, session_id: str) -> List[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )


def get_all_sessions(db: Session, user_id: int) -> List[str]:
    results = (
        db.query(ChatMessage.session_id)
        .filter(ChatMessage.user_id == user_id)
        .distinct()
        .all()
    )
    return [r[0] for r in results]
