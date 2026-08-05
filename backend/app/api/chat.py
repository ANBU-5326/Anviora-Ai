"""
WebSocket-based real-time chat endpoint (for future streaming AI responses).
REST fallback is in mentor.py for compatibility with the existing frontend service.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import decode_token
from app.repositories import user_repo, chat_repo
from app.services import mentor_service
from app.dependencies import get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageSaveRequest, ChatMessageResponse

router = APIRouter(prefix="/chat", tags=["Chat (WebSocket)"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)

    async def send_message(self, user_id: str, message: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    WebSocket chat endpoint.
    Connect with: ws://localhost:8000/api/v1/chat/ws?token=<jwt>
    """
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        user = user_repo.get_user_by_email(db, email)
        if not user:
            await websocket.close(code=1008)
            return
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(str(user.id), websocket)
    try:
        while True:
            data = await websocket.receive_text()

            # Save user message
            chat_repo.save_message(db, user.id, "ws_session", "user", data)

            # Generate and send reply
            reply = mentor_service.generate_mentor_reply(data)
            chat_repo.save_message(db, user.id, "ws_session", "mentor", reply)

            import json
            await websocket.send_text(json.dumps({
                "sender": "mentor",
                "text": reply,
                "timestamp": mentor_service.format_timestamp(),
            }))
    except WebSocketDisconnect:
        manager.disconnect(str(user.id))


@router.post("/messages", response_model=ChatMessageResponse)
def save_chat_message(
    request: ChatMessageSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a chat message to the database."""
    msg = ChatMessage(
        user_id=current_user.id,
        role=request.role,
        content=request.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/messages", response_model=List[ChatMessageResponse])
def get_chat_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load all chat messages for the current user."""
    return db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()

