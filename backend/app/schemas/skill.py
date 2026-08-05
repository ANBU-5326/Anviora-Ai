from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class SkillResponse(BaseModel):
    id: int
    subject: str
    score: int
    industry_avg: int
    full_mark: int
    A: int
    B: int

    model_config = {"from_attributes": True}


class AssessSkillRequest(BaseModel):
    subject: str
    score: int   # 0–100


class SkillAssessmentSaveRequest(BaseModel):
    subject: str
    score: int
    level: str
    benchmark: str
    feedback: Optional[str] = None
    subtopic_ratings: Optional[str] = None  # JSON string representation
    what_you_know: Optional[str] = None  # JSON string representation
    what_is_missing: Optional[str] = None  # JSON string representation
    learning_path: Optional[str] = None  # JSON string representation


class SkillAssessmentResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    score: int
    level: str
    benchmark: str
    feedback: Optional[str] = None
    subtopic_ratings: Optional[str] = None
    what_you_know: Optional[str] = None
    what_is_missing: Optional[str] = None
    learning_path: Optional[str] = None
    created_at: Any

    model_config = {"from_attributes": True}



class SkillAnalysisSaveRequest(BaseModel):
    skill_name: str
    score: int
    feedback: Optional[str] = None


class SkillAnalysisResponse(BaseModel):
    id: int
    user_id: int
    skill_name: str
    score: int
    feedback: Optional[str] = None
    created_at: Any

    model_config = {"from_attributes": True}


class ResourceItem(BaseModel):
    title: str
    url: str
    type: str


class SkillResourcesResponse(BaseModel):
    resources: Dict[str, List[ResourceItem]]


class WeakAreasResponse(BaseModel):
    weak_skills: List[SkillResponse]
    threshold: int = 60
