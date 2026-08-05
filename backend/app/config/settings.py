from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ANVIORA AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "anviora-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Database - PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:admin123@localhost:5432/anviora_db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"

    # AI Keys
    GEMINI_API_KEY: str = ""      # Primary AI - Google Gemini
    OPENAI_API_KEY: str = ""      # Optional
    ANTHROPIC_API_KEY: str = ""   # Claude - for resume/interview deep analysis

    class Config:
        env_file = (".env", "../.env")
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()