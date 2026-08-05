from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ResumeMetrics(BaseModel):
    ats_score: int
    impact_score: int
    grammar_score: int
    brevity_score: int


class ImprovementItem(BaseModel):
    section: str
    issue: str
    recommendation: str


class ResumeAnalysis(BaseModel):
    positives: List[str]
    improvements: List[ImprovementItem]


class KeywordMatch(BaseModel):
    word: str
    present: bool
    count: int


class ResumeAnalyzeResponse(BaseModel):
    id: int
    score: int
    metrics: ResumeMetrics
    analysis: ResumeAnalysis
    keyword_match: List[KeywordMatch]
    filename: str
    uploaded_at: str

    model_config = {"from_attributes": True}


class ResumeHistoryItem(BaseModel):
    id: int
    filename: str
    overall_score: int
    ats_score: int
    uploaded_at: str

    model_config = {"from_attributes": True}
