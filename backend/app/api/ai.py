from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys
import os

# Ensure the root directory (where `ai` package sits) is in sys.path so we can import from ai.llm.gemini_client
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ai.llm.gemini_client import ask_gemini_with_history

router = APIRouter(prefix="/ai", tags=["AI Integration"])

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatHistoryItem]] = None
    context: Optional[Dict[str, str]] = None
    system_prompt: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(request: AIChatRequest):
    try:
        if request.system_prompt and request.system_prompt.strip():
            system_prompt = request.system_prompt.strip()
        else:
            # Build system prompt with student context if available
            student_info = "Context not set yet"
            if request.context:
                goal = request.context.get("goal", "Not set")
                semester = request.context.get("semester", "Not set")
                skills = request.context.get("skills", "Not set")
                target = request.context.get("target", "Not set")
                student_info = f"Goal: {goal} | Semester: {semester} | Skills: {skills} | Target: {target}"

            system_prompt = f"""You are ANVIORA — an elite AI career mentor for engineering and CS students in India. 
You have deep expertise in:
- Software engineering careers (Full Stack, AI/ML, DevOps, Cloud, Cyber Security)
- Indian placement ecosystem: TCS, Infosys, Wipro, Cognizant, Accenture, product companies
- Technical interview preparation: DSA, system design, DBMS, OOPS, OS, Networks
- Resume building with ATS optimization for Indian job portals (Naukri, LinkedIn, CampusHire)
- Semester study planning, CGPA strategies, backlogs management
- Project building: suggesting projects with full tech stack recommendations
- Skill gap analysis based on target companies
- Coding platforms: LeetCode, GeeksForGeeks, HackerRank, CodeChef strategy
- Internship hunting: LinkedIn, Internshala, LetsIntern strategies

Student Context:
{student_info}

Personality: Motivating, direct, honest. Like a senior engineer who genuinely wants the student to succeed. Use simple language. Give actionable, specific advice — not generic tips.
Response format: Use markdown for code blocks, bullet points, and bold text when helpful. Keep responses under 250 words unless the student asks for a detailed study/preparation plan. Always end with exactly one concrete next action."""

        # Convert history items to dict format expected by ask_gemini_with_history
        formatted_messages = []
        if request.history:
            for item in request.history:
                formatted_messages.append({
                    "role": item.role,
                    "content": item.content
                })
        
        # Append the current message
        formatted_messages.append({
            "role": "user",
            "content": request.message
        })
        
        # We only pass the last 10 messages of history + the new message to avoid exceeding context tokens limit
        truncated_messages = formatted_messages[-11:]
        
        response_text = await ask_gemini_with_history(truncated_messages, system_prompt=system_prompt)
        return AIChatResponse(response=response_text)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))









