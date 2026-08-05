from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import ChatMessageRequest, ChatReply, ChatHistoryResponse, ChatMessageResponse, MentorMessageSaveRequest, MentorMessageResponse
from app.models.mentor import MentorMessage
from app.repositories import chat_repo
from app.services import mentor_service

router = APIRouter(prefix="/mentor", tags=["AI Mentor"])


@router.post("/chat", response_model=ChatReply)
def send_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a message to the AI mentor and receive a contextual response.
    Saves both the user message and mentor reply to chat history.
    """
    session_id = request.session_id or "default"

    # Save user message
    chat_repo.save_message(
        db, user_id=current_user.id,
        session_id=session_id,
        sender="user",
        text=request.message,
    )

    # Generate mentor reply
    reply_text = mentor_service.generate_mentor_reply(request.message)
    timestamp = mentor_service.format_timestamp()

    # Save mentor reply
    chat_repo.save_message(
        db, user_id=current_user.id,
        session_id=session_id,
        sender="mentor",
        text=reply_text,
    )

    return ChatReply(sender="mentor", text=reply_text, timestamp=timestamp)


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def get_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve conversation history for a specific chat session."""
    messages = chat_repo.get_session_messages(db, current_user.id, session_id)
    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatMessageResponse(
                id=m.id,
                sender=m.sender,
                text=m.text,
                timestamp=m.timestamp.strftime("%H:%M"),
            )
            for m in messages
        ],
    )


@router.get("/sessions")
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all unique chat session IDs for the current user."""
    sessions = chat_repo.get_all_sessions(db, current_user.id)
    return {"sessions": sessions}


@router.post("/messages", response_model=MentorMessageResponse)
def save_mentor_message(
    request: MentorMessageSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a mentor message (conversation history) to the database."""
    msg = MentorMessage(
        user_id=current_user.id,
        role=request.role,
        content=request.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/messages", response_model=List[MentorMessageResponse])
def get_mentor_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load all mentor messages (conversation history) for the current user."""
    return db.query(MentorMessage).filter(MentorMessage.user_id == current_user.id).order_by(MentorMessage.created_at.asc()).all()

