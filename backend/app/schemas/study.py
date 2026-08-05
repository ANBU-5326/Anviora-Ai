from pydantic import BaseModel
from typing import List, Optional


class TaskResponse(BaseModel):
    id: int
    text: str
    completed: bool
    difficulty: Optional[str] = "medium"

    model_config = {"from_attributes": True}


class StudyPlanResponse(BaseModel):
    id: int
    title: str
    subject: Optional[str] = ""
    duration: Optional[str] = ""
    progress: Optional[int] = 0
    priority: Optional[str] = "medium"
    exam_date: Optional[str] = None
    streak: Optional[int] = 0
    burnout_score: Optional[int] = 10
    tasks: List[TaskResponse] = []

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    text: str
    difficulty: Optional[str] = "medium"


class StudyPlanCreate(BaseModel):
    title: str
    subject: Optional[str] = ""
    duration: Optional[str] = ""
    priority: Optional[str] = "medium"
    exam_date: Optional[str] = None
    streak: Optional[int] = 0
    burnout_score: Optional[int] = 10
    tasks: Optional[List[TaskCreate]] = []



class AddTaskRequest(BaseModel):
    text: str


class TaskToggleResponse(BaseModel):
    success: bool
    plans: List[StudyPlanResponse]
