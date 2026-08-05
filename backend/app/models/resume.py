from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), default="")

    # Scores
    ats_score = Column(Integer, default=0)
    impact_score = Column(Integer, default=0)
    grammar_score = Column(Integer, default=0)
    brevity_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)

    # JSON-serialized analysis data
    positives_json = Column(Text, default="[]")
    improvements_json = Column(Text, default="[]")
    keyword_match_json = Column(Text, default="[]")

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
