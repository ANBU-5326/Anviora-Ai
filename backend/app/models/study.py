from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    subject = Column(String(100), default="")
    duration = Column(String(50), default="")
    progress = Column(Integer, default=0)  # 0–100 percentage
    priority = Column(String(50), default="medium")
    exam_date = Column(String(50), nullable=True)
    streak = Column(Integer, default=0)
    burnout_score = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="plan", cascade="all, delete-orphan")


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=False)
    text = Column(Text, nullable=False)
    completed = Column(Boolean, default=False)
    difficulty = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plan = relationship("StudyPlan", back_populates="tasks")
