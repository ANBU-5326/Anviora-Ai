from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Profile fields
    role = Column(String(50), default="Student")   # Student / Graduate / Professional
    bio = Column(Text, default="")
    avatar = Column(String(10), default="US")       # Initials abbreviation
    college = Column(String(200), default="")
    department = Column(String(100), default="")
    year = Column(String(20), default="")
    git_nickname = Column(String(100), default="")
    skills_json = Column(Text, default="[]")        # JSON array of skill strings
    saved_projects_json = Column(Text, default="[]") # JSON array of saved projects

    # Account state
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    skill_assessments = relationship("SkillAssessment", back_populates="user", cascade="all, delete-orphan")
    skill_analyses = relationship("SkillAnalysis", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    mentor_messages = relationship("MentorMessage", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    coding_stats = relationship("CodingStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    coding_suggestions = relationship("CodingSuggestion", back_populates="user", cascade="all, delete-orphan")
    placement_applications = relationship("PlacementApplication", back_populates="user", cascade="all, delete-orphan")
    placement_advice = relationship("PlacementAdvice", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
