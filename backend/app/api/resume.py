from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services import resume_service
import io

# Optional PDF/DOCX extraction libraries
try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

try:
    from docx import Document as DocxDocument
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

ALLOWED_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


@router.post("/extract-text")
async def extract_resume_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Extract plain text from a PDF, DOCX, or TXT resume file.
    Returns: { "text": "..." }
    Used by the frontend AI Resume Analyzer.
    """
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    filename = (file.filename or "").lower()
    extracted = ""

    if filename.endswith(".txt"):
        extracted = content.decode("utf-8", errors="ignore")

    elif filename.endswith(".pdf"):
        if not HAS_PYPDF:
            raise HTTPException(
                status_code=501,
                detail="PDF extraction library not installed on server. Please run: pip install pypdf"
            )
        try:
            reader = PdfReader(io.BytesIO(content))
            pages_text = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
            extracted = "\n".join(pages_text)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")

    elif filename.endswith(".docx"):
        if not HAS_DOCX:
            raise HTTPException(
                status_code=501,
                detail="DOCX extraction library not installed on server. Please run: pip install python-docx"
            )
        try:
            doc = DocxDocument(io.BytesIO(content))
            extracted = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not parse DOCX: {str(e)}")

    else:
        raise HTTPException(status_code=415, detail="Only PDF, DOCX, and TXT files are accepted.")

    if not extracted.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in this file. It may be a scanned image PDF. Please use a text-based PDF or convert to TXT."
        )

    return {"text": extracted[:30000]}  # cap at 30k chars for AI prompt




@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a resume file (PDF/DOCX/TXT) and receive a detailed ATS analysis.
    Returns: overall score, metrics, improvements, and keyword matches.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF, DOCX, and TXT files are accepted.",
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    try:
        resume = resume_service.analyze_resume_file(
            db, current_user, filename=file.filename or "resume.pdf", file_content=content
        )
        return resume_service.format_resume_response(resume)
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))


@router.get("/latest")
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the most recently analyzed resume for the current user."""
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Please upload one first.")
    return resume_service.format_resume_response(resume)


@router.get("/history")
def get_resume_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the list of all past resume uploads with scores."""
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "overall_score": r.overall_score,
            "ats_score": r.ats_score,
            "uploaded_at": r.uploaded_at.isoformat(),
        }
        for r in resumes
    ]
# ─── NEW: Save AI result directly from frontend ───────────────────────────────
import json
from pydantic import BaseModel
from typing import Any, Dict

class SaveResumeResultRequest(BaseModel):
    filename: str
    analysis: Dict[str, Any]

@router.post("/save-result")
def save_resume_result(
    payload: SaveResumeResultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores   = payload.analysis.get("scores", {})
    keywords = payload.analysis.get("keywords", {})
    sections = payload.analysis.get("sections", [])
    rec_sim  = payload.analysis.get("recruiterSim", {})

    keyword_match = (
        [{"word": w, "present": True}  for w in keywords.get("present", [])] +
        [{"word": w, "present": False} for w in keywords.get("missing", [])]
    )

    improvements = [
        {"section": s["name"], "recommendation": s.get("feedback", "")}
        for s in sections
        if s.get("status") != "strong"
    ]

    resume = Resume(
        user_id           = current_user.id,
        filename          = payload.filename,
        ats_score         = scores.get("ats",        0),
        impact_score      = scores.get("impact",     0),
        grammar_score     = scores.get("grammar",    0),
        brevity_score     = scores.get("formatting", 0),
        overall_score     = scores.get("overall",    0),
        positives_json    = json.dumps(rec_sim.get("pros", [])),
        improvements_json = json.dumps(improvements),
        keyword_match_json= json.dumps(keyword_match),
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {"message": "Resume saved successfully", "id": resume.id}