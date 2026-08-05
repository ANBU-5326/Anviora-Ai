from pydantic import BaseModel
from typing import List, Optional


class InterviewQuestion(BaseModel):
    id: int
    text: str
    hint: str


class EvaluateAnswerRequest(BaseModel):
    question_text: str
    answer_text: str
    session_id: Optional[int] = None


class EvaluateAnswerResponse(BaseModel):
    score: int
    feedback: str
    improvements: List[str]


class InterviewSessionResponse(BaseModel):
    id: int
    category: str
    overall_score: int
    answer_count: int
    created_at: str

    model_config = {"from_attributes": True}
