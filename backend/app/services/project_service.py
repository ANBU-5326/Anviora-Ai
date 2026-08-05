from typing import List, Optional
import json

PROJECT_DATABASE = [
    {
        "id": 1,
        "title": "AI-Powered Resume Analyzer",
        "description": "Build a web app that analyzes resumes using NLP to detect ATS keywords, provide ATS scores, and suggest improvements tailored to job descriptions.",
        "difficulty": "Intermediate",
        "stack": ["Python", "FastAPI", "React", "Gemini API", "PostgreSQL"],
        "tags": ["AI", "NLP", "Full Stack"],
        "career_match": ["Backend", "AI/ML", "Full Stack"],
        "estimated_time": "3-4 weeks",
        "github_stars": 245,
    },
    {
        "id": 2,
        "title": "Real-Time Collaborative Code Editor",
        "description": "Create a VS Code-like browser editor with real-time multi-user collaboration, syntax highlighting, and WebSocket-based change sync.",
        "difficulty": "Advanced",
        "stack": ["React", "Node.js", "Socket.IO", "Monaco Editor", "Redis"],
        "tags": ["Real-Time", "WebSocket", "Collaboration"],
        "career_match": ["Frontend", "Full Stack"],
        "estimated_time": "5-6 weeks",
        "github_stars": 412,
    },
    {
        "id": 3,
        "title": "Student Placement Tracker Dashboard",
        "description": "A comprehensive dashboard for students to track job applications, interview stages, and offer statuses with calendar integration and email reminders.",
        "difficulty": "Beginner",
        "stack": ["React", "Firebase", "Tailwind CSS"],
        "tags": ["Dashboard", "CRUD", "Auth"],
        "career_match": ["Frontend", "Full Stack"],
        "estimated_time": "2-3 weeks",
        "github_stars": 89,
    },
    {
        "id": 4,
        "title": "LeetCode Progress Tracker with AI Hints",
        "description": "Track DSA problem-solving progress across LeetCode with category breakdown, daily streak, and AI-generated hints for stuck problems.",
        "difficulty": "Intermediate",
        "stack": ["Next.js", "Python", "FastAPI", "OpenAI API", "SQLite"],
        "tags": ["AI", "DSA", "Tracker"],
        "career_match": ["Full Stack", "AI/ML"],
        "estimated_time": "3-4 weeks",
        "github_stars": 178,
    },
    {
        "id": 5,
        "title": "Microservices E-Commerce Platform",
        "description": "Build a production-ready e-commerce platform using microservices architecture with separate services for auth, catalog, orders, and payments.",
        "difficulty": "Advanced",
        "stack": ["Node.js", "Docker", "Kubernetes", "PostgreSQL", "Redis", "RabbitMQ"],
        "tags": ["Microservices", "DevOps", "Backend"],
        "career_match": ["Backend", "DevOps"],
        "estimated_time": "8-10 weeks",
        "github_stars": 567,
    },
    {
        "id": 6,
        "title": "Personal Finance Dashboard",
        "description": "Expense tracker with category analytics, budget goals, recurring transaction detection, and monthly spending reports with interactive charts.",
        "difficulty": "Beginner",
        "stack": ["React", "Chart.js", "Node.js", "MongoDB"],
        "tags": ["Finance", "Charts", "CRUD"],
        "career_match": ["Frontend", "Full Stack"],
        "estimated_time": "2-3 weeks",
        "github_stars": 134,
    },
    {
        "id": 7,
        "title": "AI Chatbot with RAG (Retrieval-Augmented Generation)",
        "description": "Build a document Q&A chatbot that reads PDFs/docs and answers questions using vector similarity search and LLM generation.",
        "difficulty": "Advanced",
        "stack": ["Python", "LangChain", "ChromaDB", "FastAPI", "Streamlit", "Gemini API"],
        "tags": ["AI", "RAG", "LLM", "NLP"],
        "career_match": ["AI/ML", "Backend"],
        "estimated_time": "4-5 weeks",
        "github_stars": 892,
    },
    {
        "id": 8,
        "title": "DevOps CI/CD Pipeline Demo Project",
        "description": "Set up a complete CI/CD pipeline for a sample web app: GitHub Actions, Docker containerization, automated tests, and deployment to AWS/GCP.",
        "difficulty": "Intermediate",
        "stack": ["Docker", "GitHub Actions", "AWS EC2", "Nginx", "Python/Node.js"],
        "tags": ["DevOps", "CI/CD", "Cloud"],
        "career_match": ["DevOps", "Backend"],
        "estimated_time": "3-4 weeks",
        "github_stars": 203,
    },
]


def get_recommendations(skills: List[str] = None, difficulty: str = None) -> List[dict]:
    """Return project recommendations, optionally filtered."""
    projects = PROJECT_DATABASE.copy()

    if difficulty:
        projects = [p for p in projects if p["difficulty"].lower() == difficulty.lower()]

    if skills:
        skill_lower = [s.lower() for s in skills]
        def relevance_score(p):
            return sum(1 for tech in p["stack"] if any(s in tech.lower() for s in skill_lower))
        projects.sort(key=relevance_score, reverse=True)

    return projects


def generate_ai_recommendations(user_profile: dict) -> List[dict]:
    """
    Generate AI project recommendations based on user profile.
    Calls Gemini AI and returns personalized project ideas.
    Falls back to static list if AI fails.
    """
    skills = user_profile.get("skills", [])
    role = user_profile.get("role", "Student")

    try:
        import asyncio
        from ai.llm.gemini_client import ask_gemini

        prompt = f"""You are a project recommendation AI for students.
User role: {role}
User skills: {', '.join(skills) if skills else 'General programming'}

Return ONLY a JSON array of 4 project recommendations. No extra text.
Each project must have these exact fields:
- id (integer, start from 100)
- title (string)
- description (string, 1-2 sentences)
- difficulty (one of: Beginner, Intermediate, Advanced)
- stack (array of strings, max 5 technologies)
- tags (array of strings, max 3)
- career_match (array of strings)
- estimated_time (string like "2-3 weeks")
- github_stars (integer)

Match projects to the user's skills. Return only the JSON array."""

        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        ai_response = loop.run_until_complete(ask_gemini(prompt))
        loop.close()

        # Extract JSON from response
        import re
        match = re.search(r'\[.*\]', ai_response, re.DOTALL)
        if match:
            ai_projects = json.loads(match.group())
            if isinstance(ai_projects, list) and len(ai_projects) > 0:
                # Combine AI projects with static ones
                static = get_recommendations(skills=skills)[:4]
                return ai_projects + static

    except Exception as e:
        print(f"AI recommendation failed, using static list: {e}")

    # Fallback to static recommendations
    return get_recommendations(skills=skills)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          