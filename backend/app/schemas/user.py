from pydantic import BaseModel, EmailStr
from typing import Optional, List


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    git_nickname: Optional[str] = None
    skills: Optional[List[str]] = None


class SkillsUpdateRequest(BaseModel):
    skills: List[str]


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    bio: str
    avatar: str
    college: str
    department: str
    year: str
    git_nickname: str
    skills: List[str] = []

    model_config = {"from_attributes": True}


class DashboardStatsResponse(BaseModel):
    study_count: int
    avg_progress: int
    skill_count: int
    coding_streak: int
    placement_count: int
    resume_score: int
    readiness_technical: int
    readiness_resume: int
    readiness_interview: int
    role_iqs: Optional[dict] = None
    company_iqs: Optional[dict] = None
    placement_iq: Optional[int] = None
    readiness_time: Optional[str] = None

