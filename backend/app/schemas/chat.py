from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessageRequest(BaseModel):
    message: str
    session_id: str = "default"


class ChatMessageSaveRequest(BaseModel):
    role: str
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    text: str
    timestamp: str

    model_config = {"from_attributes": True}


class MentorMessageSaveRequest(BaseModel):
    role: str
    content: str


class MentorMessageResponse(BaseModel):
    id: int
    user_id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatReply(BaseModel):
    sender: str = "mentor"
    text: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageResponse]
