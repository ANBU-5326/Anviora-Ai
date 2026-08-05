from ai.llm.gemini_client import ask_gemini
import json

RESUME_SYSTEM_PROMPT = """
You are an expert, strict, and honest resume reviewer and ATS specialist.

FIRST STEP - RESUME VERIFICATION:
Determine if the provided text is genuinely a candidate's Resume or Curriculum Vitae (CV).
A resume/CV is a document detailing personal education, work experience, technical/professional skills, projects, certifications, or contact details.

If the text is NOT a resume (e.g. an academic assignment, research paper, invoice, receipt, source code file, book chapter, financial report, recipe, random text):
Return ONLY a JSON response:
{
    "is_resume": false,
    "reason": "This document appears to be a [specify document type, e.g., research paper / Python script / math homework / invoice] rather than a candidate resume."
}

If it IS a resume:
Analyze it strictly and honestly. Do not inflate scores.
Return ONLY a JSON response:
{
    "is_resume": true,
    "ats_score": <0-100 honest score>,
    "impact_score": <0-100 honest score>,
    "grammar_score": <0-100 honest score>,
    "brevity_score": <0-100 honest score>,
    "overall_score": <0-100 honest score>,
    "positives": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "keyword_match": ["keyword1", "keyword2", "keyword3"],
    "summary": "2-3 sentence honest overall feedback"
}
"""

async def analyze_resume(resume_text: str) -> dict:
    """Analyze a resume and return scores + feedback, or indicate if not a resume."""
    if not resume_text or len(resume_text.strip()) < 40:
        return {
            "is_resume": False,
            "reason": "The uploaded document contains no readable text or is too short to be a candidate resume."
        }

    prompt = f"""
    Analyze this text and return ONLY a JSON response:
    
    Document text:
    {resume_text}
    """
    
    response = await ask_gemini(prompt, RESUME_SYSTEM_PROMPT)
    
    try:
        clean = response.strip().replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
        return parsed
    except Exception:
        return {
            "is_resume": True,
            "ats_score": 50,
            "impact_score": 50,
            "grammar_score": 50,
            "brevity_score": 50,
            "overall_score": 50,
            "positives": ["Resume received"],
            "improvements": ["Could not fully analyze — please try again"],
            "keyword_match": [],
            "summary": "Analysis incomplete. Please try again."
        }

