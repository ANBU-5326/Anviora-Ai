from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class PlacementApplication(Base):
    __tablename__ = "placement_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)
    status = Column(String(50), default="Applied")   # Applied / Screening / Interviewing / Offered / Rejected
    date_applied = Column(String(20), default="")    # ISO date string
    salary = Column(String(100), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="placement_applications")


class PlacementAdvice(Base):
    __tablename__ = "placement_advice"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="placement_advice")

