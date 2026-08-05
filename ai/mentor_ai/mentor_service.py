from ai.llm.gemini_client import ask_gemini, ask_gemini_with_history

MENTOR_SYSTEM_PROMPT = """
You are ANVIORA AI Mentor — a smart, friendly academic and career mentor for engineering students.
Your job is to help students with:
- Study plans and learning strategies
- Career guidance and placement preparation
- Coding problems and technical concepts
- Resume and interview tips
- Project ideas and recommendations

Always respond in a helpful, encouraging, and concise way.
Keep responses focused and practical. Use bullet points when listing steps.
Address the student directly and personally.
"""

async def get_mentor_response(user_message: str, chat_history: list = []) -> str:
    """Get AI mentor response for a student message."""
    
    if chat_history:
        # Multi-turn conversation
        messages = chat_history + [{"role": "user", "content": user_message}]
        return await ask_gemini_with_history(messages, MENTOR_SYSTEM_PROMPT)
    else:
        # Single message
        return await ask_gemini(user_message, MENTOR_SYSTEM_PROMPT)


async def get_study_plan(subject: str, duration: str, level: str = "beginner") -> str:
    """Generate a personalized study plan."""
    prompt = f"""
    Create a detailed study plan for:
    - Subject: {subject}
    - Duration: {duration}
    - Student level: {level}
    
    Include:
    1. Week-by-week breakdown
    2. Key topics to cover
    3. Recommended resources
    4. Practice exercises
    5. Milestones to track progress
    """
    return await ask_gemini(prompt, MENTOR_SYSTEM_PROMPT)


async def get_project_recommendations(skills: list, interests: str = "") -> str:
    """Recommend projects based on student skills."""
    skills_str = ", ".join(skills) if skills else "general programming"
    prompt = f"""
    Recommend 5 project ideas for a student with these skills: {skills_str}
    {f'Interests: {interests}' if interests else ''}
    
    For each project include:
    - Project name and description
    - Technologies to use
    - Difficulty level
    - Why it's good for placement/career
    - GitHub repo structure suggestion
    """
    return await ask_gemini(prompt, MENTOR_SYSTEM_PROMPT)
