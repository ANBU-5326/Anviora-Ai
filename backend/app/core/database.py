from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings

import os

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# If running on Render cloud environment and DATABASE_URL points to unreachable localhost, fallback to SQLite
if (os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID")) and ("localhost" in db_url or "127.0.0.1" in db_url):
    db_url = "sqlite:///./anviora.db"

is_postgres = db_url.startswith("postgresql")

# SQLite needs connect_args for threading; PostgreSQL does not
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=settings.DEBUG,  # Log all SQL in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Called on app startup to create all tables if they don't exist."""
    # Import all models so SQLAlchemy knows about them before creating tables
    from app.models import user, study, skill, resume, chat, mentor, interview, coding, placement, notification  # noqa: F401
    Base.metadata.create_all(bind=engine)

    from sqlalchemy import text

    def add_column_if_missing(conn, table, col_name, col_type):
        if is_postgres:
            # PostgreSQL supports IF NOT EXISTS natively
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                conn.commit()
            except Exception:
                conn.rollback()
        else:
            # SQLite: no IF NOT EXISTS support, swallow duplicate-column error
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

    with engine.connect() as conn:
        # study_plans extra columns
        for col_name, col_type in [
            ("priority", "VARCHAR(50) DEFAULT 'medium'"),
            ("exam_date", "VARCHAR(50)"),
            ("streak", "INTEGER DEFAULT 0"),
            ("burnout_score", "INTEGER DEFAULT 10"),
        ]:
            add_column_if_missing(conn, "study_plans", col_name, col_type)

        # users extra columns
        add_column_if_missing(conn, "users", "saved_projects_json", "TEXT DEFAULT '[]'")

        # coding_submissions extra columns
        for col_name, col_type in [
            ("topic", "VARCHAR(100) DEFAULT 'General'"),
            ("platform", "VARCHAR(100) DEFAULT 'LeetCode'"),
            ("notes", "TEXT DEFAULT ''"),
        ]:
            add_column_if_missing(conn, "coding_submissions", col_name, col_type)

        # coding_stats extra columns
        for col_name, col_type in [
            ("timezone", "VARCHAR(50) DEFAULT 'Asia/Kolkata'"),
            ("streak_freezes_remaining", "INTEGER DEFAULT 2"),
            ("last_streak_freeze_at", "TIMESTAMP" if is_postgres else "DATETIME"),
        ]:
            add_column_if_missing(conn, "coding_stats", col_name, col_type)
