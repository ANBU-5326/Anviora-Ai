import sys
import os

# Ensure the project root directory (where `ai` package sits) is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.core.database import create_all_tables
from app.api import (
    auth,
    users,
    skills,
    resume,
    study,
    mentor,
    projects,
    dashboard,
    interview,
    chat,
    coding,
    placements,
    notifications,
    ai,
)

# Initialize database tables
create_all_tables()

# Create upload directory if it does not exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# CORS configuration — explicit origins to ensure React dev server always works
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Serve static upload files
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(skills.router)
app.include_router(resume.router)
app.include_router(study.router)
app.include_router(mentor.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(interview.router)
app.include_router(chat.router)
app.include_router(coding.router)
app.include_router(placements.router)
app.include_router(notifications.router)
app.include_router(ai.router)


@app.get("/")
def home():
    return {
        "message": "Hello from ANVIORA AI Backend API",
        "status": "online",
        "version": settings.APP_VERSION,
    }