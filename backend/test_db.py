from app.core.database import SessionLocal
from app.models.study import StudyPlan, StudyTask
from app.models.user import User

db = SessionLocal()
try:
    users = db.query(User).all()
    print("Users:", [u.email for u in users])
    plans = db.query(StudyPlan).all()
    print("Plans:", [(p.id, p.title, p.user_id) for p in plans])
    tasks = db.query(StudyTask).all()
    print("Tasks:", [(t.id, t.text, t.plan_id) for t in tasks])
finally:
    db.close()
