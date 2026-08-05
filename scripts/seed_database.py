import os
import sys
import json
from datetime import datetime, timedelta

# Add backend directory to path so we can import app modules
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_all_tables
from app.models.user import User
from app.models.skill import UserSkill
from app.models.study import StudyPlan, StudyTask
from app.models.coding import CodingStats, CodingSubmission
from app.models.interview import InterviewSession, InterviewAnswer
from app.models.placement import PlacementApplication
from app.models.notification import Notification
from app.models.resume import Resume
from app.core.security import hash_password


def seed_db():
    print("Initializing database tables...")
    create_all_tables()
    db = SessionLocal()
    try:
        # Check if test user exists
        test_email = "test@example.com"
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            print(f"User {test_email} already exists. Deleting to re-seed...")
            db.delete(existing_user)
            db.commit()

        print("Creating test user...")
        # 1. User
        user = User(
            name="John Doe",
            email=test_email,
            password_hash=hash_password("password123"),
            role="Student",
            bio="Aspiring Full-Stack Software Engineer with a passion for web development and machine learning.",
            avatar="JD",
            college="State University of Technology",
            department="Computer Science & Engineering",
            year="4th Year",
            git_nickname="johndoe-dev",
            skills_json=json.dumps(["Python", "React", "FastAPI", "SQL", "Docker"]),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Test user created with ID: {user.id}")

        # 2. User Skills
        skills_data = [
            {"subject": "Python", "score": 85, "industry_avg": 70, "full_mark": 100},
            {"subject": "React", "score": 78, "industry_avg": 65, "full_mark": 100},
            {"subject": "FastAPI", "score": 82, "industry_avg": 60, "full_mark": 100},
            {"subject": "SQL", "score": 70, "industry_avg": 55, "full_mark": 100},
            {"subject": "Docker", "score": 60, "industry_avg": 50, "full_mark": 100},
        ]
        print("Seeding user skills...")
        for skill in skills_data:
            db.add(UserSkill(user_id=user.id, **skill))

        # 3. Study Plan
        print("Seeding study plans & tasks...")
        plan = StudyPlan(
            user_id=user.id,
            title="Full-Stack Developer Roadmap",
            subject="Web Development",
            duration="12 Weeks",
            progress=50
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        tasks = [
            StudyTask(plan_id=plan.id, text="Complete Python OOP fundamentals", completed=True),
            StudyTask(plan_id=plan.id, text="Build REST API with FastAPI and SQLite", completed=True),
            StudyTask(plan_id=plan.id, text="Master React Hooks & Context API", completed=False),
            StudyTask(plan_id=plan.id, text="Deploy full-stack app using Docker", completed=False),
        ]
        db.add_all(tasks)

        # 4. Coding Stats & Submissions
        print("Seeding coding stats & submissions...")
        coding_stats = CodingStats(
            user_id=user.id,
            solved_count=42,
            total_count=800,
            easy_solved=20,
            medium_solved=17,
            hard_solved=5,
            streak=8,
            rank="Knight",
            last_submission_at=datetime.utcnow()
        )
        db.add(coding_stats)
        db.commit()
        db.refresh(coding_stats)

        submissions = [
            CodingSubmission(stats_id=coding_stats.id, title="Two Sum", difficulty="Easy", status="Accepted"),
            CodingSubmission(stats_id=coding_stats.id, title="3Sum", difficulty="Medium", status="Accepted"),
            CodingSubmission(stats_id=coding_stats.id, title="Reverse Integer", difficulty="Medium", status="Wrong Answer"),
            CodingSubmission(stats_id=coding_stats.id, title="Edit Distance", difficulty="Hard", status="Accepted"),
            CodingSubmission(stats_id=coding_stats.id, title="LRU Cache", difficulty="Medium", status="Accepted"),
        ]
        db.add_all(submissions)

        # 5. Interview Session & Answers
        print("Seeding interview sessions & answers...")
        session = InterviewSession(
            user_id=user.id,
            category="frontend",
            overall_score=85
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        answers = [
            InterviewAnswer(
                session_id=session.id,
                question_text="Explain React Virtual DOM and how reconciliation works.",
                answer_text="React creates a virtual representation of the DOM in memory. When state changes, it compares the new virtual DOM with the previous one (diffing) and updates only the changed elements in the real DOM.",
                score=90,
                feedback="Excellent answer. Clearly articulated the concepts of diffing and reconciliation.",
                improvements_json=json.dumps(["Explain keys in lists", "Mention the fiber engine architecture"])
            ),
            InterviewAnswer(
                session_id=session.id,
                question_text="What is the difference between let, const, and var in JavaScript?",
                answer_text="var is function-scoped and hoisted. let and const are block-scoped. const variables cannot be reassigned.",
                score=80,
                feedback="Good summary. However, mention hoisting detail for let/const (temporal dead zone).",
                improvements_json=json.dumps(["Explain Temporal Dead Zone (TDZ)", "Explain mutation of const objects"])
            )
        ]
        db.add_all(answers)

        # 6. Placement Applications
        print("Seeding placement applications...")
        placements = [
            PlacementApplication(
                user_id=user.id,
                company="Google",
                role="Software Engineer L3 (Frontend)",
                status="Interviewing",
                date_applied=(datetime.utcnow() - timedelta(days=20)).strftime("%Y-%m-%d"),
                salary="140,000 USD",
                notes="Completed initial screening. Preparing for technical rounds."
            ),
            PlacementApplication(
                user_id=user.id,
                company="Stripe",
                role="Backend Engineer Intern",
                status="Offered",
                date_applied=(datetime.utcnow() - timedelta(days=35)).strftime("%Y-%m-%d"),
                salary="55 USD/hr",
                notes="Offer received! Need to respond by next Friday."
            ),
            PlacementApplication(
                user_id=user.id,
                company="Meta",
                role="Production Engineer",
                status="Rejected",
                date_applied=(datetime.utcnow() - timedelta(days=40)).strftime("%Y-%m-%d"),
                salary="135,000 USD",
                notes="Screening went well, but coding round had issues with time complexity constraints."
            ),
        ]
        db.add_all(placements)

        # 7. Notifications
        print("Seeding notifications...")
        notifications = [
            Notification(
                user_id=user.id,
                type="info",
                title="Welcome to Anviora AI",
                message="Explore your customized dashboards for interview prep, resume scanning, and study schedules.",
                is_read=False
            ),
            Notification(
                user_id=user.id,
                type="ai_suggestion",
                title="Study Alert",
                message="AI suggest: Focus on mastering 'Temporal Dead Zone' in JavaScript to improve your next frontend score.",
                is_read=False
            ),
            Notification(
                user_id=user.id,
                type="reminder",
                title="Google Interview Tomorrow",
                message="Don't forget your scheduled technical screen at 10:00 AM PST.",
                is_read=True
            ),
        ]
        db.add_all(notifications)

        # 8. Resume scans
        print("Seeding resume analyses...")
        resumes = [
            Resume(
                user_id=user.id,
                filename="John_Doe_CS_Resume.pdf",
                ats_score=82,
                impact_score=78,
                grammar_score=95,
                brevity_score=80,
                overall_score=84,
                positives_json=json.dumps([
                    "Strong action verbs used in experience descriptions.",
                    "Clean formatting with standard professional sections.",
                    "Clear contact details and GitHub link present."
                ]),
                improvements_json=json.dumps([
                    "Quantify more achievements (e.g., 'reduced latency by 20%').",
                    "Add key course projects details to highlight technical breadth.",
                    "Shorten professional summary to 2 lines."
                ]),
                keyword_match_json=json.dumps([
                    {"keyword": "Python", "status": "Matched"},
                    {"keyword": "React", "status": "Matched"},
                    {"keyword": "Kubernetes", "status": "Missing"},
                    {"keyword": "CI/CD", "status": "Missing"}
                ])
            )
        ]
        db.add_all(resumes)

        db.commit()
        print("Database successfully seeded!")
        print(f"Login credentials: \nEmail: {test_email}\nPassword: password123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
