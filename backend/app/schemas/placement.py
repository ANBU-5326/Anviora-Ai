from pydantic import BaseModel
from typing import Optional


class PlacementApplicationCreate(BaseModel):
    company: str
    role: str
    salary: Optional[str] = ""
    notes: Optional[str] = ""


class PlacementApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    status: str
    date_applied: str
    salary: str
    notes: str

    model_config = {"from_attributes": True}


class UpdateStatusRequest(BaseModel):
    status: str   # Applied / Screening / Interviewing / Offered / Rejected


class PlacementUpdateRequest(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[str] = None
    notes: Optional[str] = None


class PlacementAdviceSaveRequest(BaseModel):
    content: str


class PlacementAdviceResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: str  # We will serialize as ISO format or similar string

    model_config = {"from_attributes": True}

