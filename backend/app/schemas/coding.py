from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SubmissionResponse(BaseModel):
    id: int
    title: str
    difficulty: str
    status: str
    topic: Optional[str] = "General"
    platform: Optional[str] = "LeetCode"
    notes: Optional[str] = ""
    submitted_at: str

    model_config = {"from_attributes": True}


class CodingStatsResponse(BaseModel):
    solved_count: int
    total_count: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    streak: int
    timezone: Optional[str] = "Asia/Kolkata"
    streak_freezes_remaining: Optional[int] = 2
    rank: str
    recent_submissions: List[SubmissionResponse] = []

    model_config = {"from_attributes": True}


class LogProblemRequest(BaseModel):
    title: str
    difficulty: str   # Easy / Medium / Hard
    status: str       # Accepted / Wrong Answer / Time Limit Exceeded
    topic: Optional[str] = "General"
    platform: Optional[str] = "LeetCode"
    notes: Optional[str] = ""


class ActivityDay(BaseModel):
    date: str
    count: int


class CodingSuggestionSaveRequest(BaseModel):
    content: str


class CodingSuggestionResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: str

    model_config = {"from_attributes": True}


class CodeRunRequest(BaseModel):
    source_code: str
    language: str = "python" # python / javascript / cpp / java
    stdin: Optional[str] = ""
    expected_output: Optional[str] = ""


class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    compile_output: str
    status: str             # Accepted / Wrong Answer / Time Limit Exceeded / Error
    execution_time: float   # Seconds
    memory: int            # KB
    is_correct: bool

