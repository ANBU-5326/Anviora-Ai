from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class CodingStats(Base):
    __tablename__ = "coding_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    solved_count = Column(Integer, default=0)
    total_count = Column(Integer, default=800)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    timezone = Column(String(50), default="Asia/Kolkata")
    streak_freezes_remaining = Column(Integer, default=2)
    last_streak_freeze_at = Column(DateTime, nullable=True)
    rank = Column(String(20), default="N/A")
    last_submission_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="coding_stats")
    submissions = relationship("CodingSubmission", back_populates="stats", cascade="all, delete-orphan")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    stats_id = Column(Integer, ForeignKey("coding_stats.id"), nullable=False)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(20), default="Medium")   # Easy / Medium / Hard
    status = Column(String(50), default="Accepted")     # Accepted / WA / TLE etc.
    topic = Column(String(100), default="General")
    platform = Column(String(100), default="LeetCode")
    notes = Column(Text, default="")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    stats = relationship("CodingStats", back_populates="submissions")


class CodingSuggestion(Base):
    __tablename__ = "coding_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="coding_suggestions")

