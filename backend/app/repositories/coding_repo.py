from sqlalchemy.orm import Session
from app.models.coding import CodingStats, CodingSubmission
from typing import Optional
from datetime import datetime


def get_or_create_stats(db: Session, user_id: int) -> CodingStats:
    stats = db.query(CodingStats).filter(CodingStats.user_id == user_id).first()
    if not stats:
        stats = CodingStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


from zoneinfo import ZoneInfo
from datetime import datetime, timezone


def update_timezone_aware_streak(stats: CodingStats):
    user_tz_name = getattr(stats, "timezone", "Asia/Kolkata") or "Asia/Kolkata"
    try:
        tz = ZoneInfo(user_tz_name)
    except Exception:
        tz = ZoneInfo("Asia/Kolkata")

    now_utc = datetime.now(timezone.utc)
    now_local = now_utc.astimezone(tz).date()

    if not stats.last_submission_at:
        stats.streak = 1
        stats.last_submission_at = datetime.utcnow()
        return

    last_utc = stats.last_submission_at.replace(tzinfo=timezone.utc)
    last_local = last_utc.astimezone(tz).date()

    day_diff = (now_local - last_local).days

    if day_diff == 0:
        # Same day — maintain streak
        if stats.streak == 0:
            stats.streak = 1
    elif day_diff == 1:
        # Consecutive day — increment streak
        stats.streak += 1
    elif day_diff > 1:
        # Missed day — check streak freeze eligibility
        freezes = getattr(stats, "streak_freezes_remaining", 0) or 0
        if freezes > 0 and day_diff == 2:
            # Consume 1 streak freeze to preserve streak!
            stats.streak_freezes_remaining = freezes - 1
            stats.last_streak_freeze_at = datetime.utcnow()
            stats.streak += 1
        else:
            stats.streak = 1

    stats.last_submission_at = datetime.utcnow()


def log_submission(db: Session, stats: CodingStats, title: str, difficulty: str, status: str, topic: str = "General", platform: str = "LeetCode", notes: str = "") -> CodingSubmission:
    # Update aggregate counts
    if status == "Accepted":
        stats.solved_count += 1
        if difficulty == "Easy":
            stats.easy_solved += 1
        elif difficulty == "Medium":
            stats.medium_solved += 1
        elif difficulty == "Hard":
            stats.hard_solved += 1

    update_timezone_aware_streak(stats)
    db.commit()

    # Add submission record
    submission = CodingSubmission(
        stats_id=stats.id,
        title=title,
        difficulty=difficulty,
        status=status,
        topic=topic,
        platform=platform,
        notes=notes
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def get_recent_submissions(db: Session, stats_id: int, limit: int = 10):
    return (
        db.query(CodingSubmission)
        .filter(CodingSubmission.stats_id == stats_id)
        .order_by(CodingSubmission.submitted_at.desc())
        .limit(limit)
        .all()
    )
