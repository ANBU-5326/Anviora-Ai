from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    score = Column(Integer, default=50)          # User's score (0-100)
    industry_avg = Column(Integer, default=60)   # Benchmark comparison
    full_mark = Column(Integer, default=100)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_skills")


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    level = Column(String(50), nullable=False)  # beginner/intermediate/advanced
    benchmark = Column(String(100), nullable=False)  # top 10%, top 25%, average, below average
    feedback = Column(String(1000), nullable=True)
    subtopic_ratings = Column(String(2000), nullable=True)  # JSON representation
    what_you_know = Column(String(2000), nullable=True)  # JSON representation
    what_is_missing = Column(String(2000), nullable=True)  # JSON representation
    learning_path = Column(String(4000), nullable=True)  # JSON representation
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_assessments")


class SkillAnalysis(Base):
    __tablename__ = "skill_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_analyses")


# ─── 360° SKILL ANALYZER MODELS ──────────────────────────────────────────────

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, nullable=False) # e.g., "AI Engineer"
    category = Column(String(50), default="Engineering")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    required_skills = relationship("CareerRequiredSkill", back_populates="career", cascade="all, delete-orphan")


class CareerRequiredSkill(Base):
    __tablename__ = "career_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)       # e.g., "Python"
    required_level = Column(Integer, nullable=False)        # Benchmark score 0-100
    importance_weight = Column(Float, default=1.0)

    career = relationship("Career", back_populates="required_skills")


class UserSkillProfile360(Base):
    __tablename__ = "user_skill_profiles_360"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)

    # Weighted overall score (0-100)
    overall_score = Column(Float, default=0.0)

    # Categorical breakdown scores (0-100)
    programming_score = Column(Float, default=0.0)
    ai_score = Column(Float, default=0.0)
    database_score = Column(Float, default=0.0)
    math_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    resume_score = Column(Float, default=0.0)
    github_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    softskills_score = Column(Float, default=0.0)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    career = relationship("Career")


class SkillAssessment360(Base):
    __tablename__ = "skill_assessments_360"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)          # programming/ai/database/math/communication/etc.
    score_achieved = Column(Float, nullable=False)
    max_score = Column(Float, default=100.0)
    details_json = Column(Text, nullable=True)             # LLM & test breakdown JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class SkillLearningRecommendation(Base):
    __tablename__ = "skill_learning_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    gap_score = Column(Integer, nullable=False)            # e.g., Benchmark 80 - Actual 60 = Gap 20
    action_title = Column(String(255), nullable=False)
    action_type = Column(String(50), default="course")     # course/project/reading/quiz
    estimated_hours = Column(Integer, default=2)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class SkillProgressHistory(Base):
    __tablename__ = "skill_progress_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    recorded_score = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


