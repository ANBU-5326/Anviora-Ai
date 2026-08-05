from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
import json
from pydantic import BaseModel
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.interview import InterviewSession, InterviewAnswer
from app.schemas.interview import InterviewQuestion, EvaluateAnswerRequest, EvaluateAnswerResponse, InterviewSessionResponse
from app.services import interview_service

router = APIRouter(prefix="/interview", tags=["Interview Coach"])


@router.get("/questions", response_model=List[InterviewQuestion])
def get_questions(
    category: str = "frontend",
    current_user: User = Depends(get_current_user),
):
    questions = interview_service.get_questions(category)
    return [InterviewQuestion(**q) for q in questions]


@router.post("/evaluate", response_model=EvaluateAnswerResponse)
def evaluate_answer(
    request: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = interview_service.evaluate_answer(request.question_text, request.answer_text)

    if request.session_id:
        session = db.query(InterviewSession).filter(
            InterviewSession.id == request.session_id,
            InterviewSession.user_id == current_user.id,
        ).first()
        if session:
            answer = InterviewAnswer(
                session_id=session.id,
                question_text=request.question_text,
                answer_text=request.answer_text,
                score=result["score"],
                feedback=result["feedback"],
                improvements_json=json.dumps(result["improvements"]),
            )
            db.add(answer)
            db.commit()

    return EvaluateAnswerResponse(**result)


@router.post("/sessions", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    category: str = "frontend",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = InterviewSession(user_id=current_user.id, category=category)
    db.add(session)
    db.commit()
    db.refresh(session)
    return InterviewSessionResponse(
        id=session.id,
        category=session.category,
        overall_score=session.overall_score,
        answer_count=0,
        created_at=session.created_at.isoformat(),
    )


@router.get("/history", response_model=List[InterviewSessionResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    return [
        InterviewSessionResponse(
            id=s.id,
            category=s.category,
            overall_score=s.overall_score,
            answer_count=len(s.answers),
            created_at=s.created_at.isoformat(),
        )
        for s in sessions
    ]


# ─── NEW: Save full session result directly from frontend ─────────────────────

class SaveAnswerItem(BaseModel):
    question_text: str
    answer_text: str
    score: int
    verdict: str
    improvements: List[str]
    strengths: List[str]
    time_taken: str


class SaveInterviewSessionRequest(BaseModel):
    category: str
    difficulty: str
    company: Optional[str] = None
    overall_score: int
    answers: List[SaveAnswerItem]


@router.post("/save-session", status_code=status.HTTP_201_CREATED)
def save_interview_session(
    payload: SaveInterviewSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Create session
    session = InterviewSession(
        user_id=current_user.id,
        category=payload.category,
        overall_score=payload.overall_score,
    )
    db.add(session)
    db.flush()  # get session.id without committing

    # Save each answer
    for a in payload.answers:
        answer = InterviewAnswer(
            session_id=session.id,
            question_text=a.question_text,
            answer_text=a.answer_text,
            score=a.score,
            feedback=a.verdict,
            improvements_json=json.dumps(a.improvements),
        )
        db.add(answer)

    db.commit()
    db.refresh(session)

    return {
        "message": "Interview session saved successfully",
        "id": session.id,
        "overall_score": session.overall_score,
        "answer_count": len(payload.answers),
    }
