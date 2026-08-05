from pydantic import BaseModel
from typing import Optional, Dict


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: str

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int


class NotificationPreferencesRequest(BaseModel):
    study_reminders: Optional[bool] = True
    interview_reminders: Optional[bool] = True
    placement_alerts: Optional[bool] = True
    ai_suggestions: Optional[bool] = True
