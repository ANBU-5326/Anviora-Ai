import os
import sys
import argparse

# Add backend directory to path so we can import app modules
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_all_tables
from app.models.user import User
from app.core.security import hash_password


def create_admin_user(name, email, password, role):
    create_all_tables()
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: User with email '{email}' already exists.")
            sys.exit(1)

        avatar = "".join(w[0].upper() for w in name.split()[:2]) or "AD"
        new_user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            avatar=avatar,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Success: Created user '{name}' ({email}) with role '{role}' successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error creating user: {e}")
        sys.exit(1)
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create a new user in the Anviora AI database.")
    parser.add_argument("--name", help="Full name of the user")
    parser.add_argument("--email", help="Email address of the user")
    parser.add_argument("--password", help="Password for the user")
    parser.add_argument("--role", default="Student", choices=["Student", "Graduate", "Professional", "Admin"], 
                        help="Role of the user (default: Student)")

    args = parser.parse_args()

    # If args are not fully provided, prompt the user interactively
    name = args.name
    email = args.email
    password = args.password
    role = args.role

    if not name:
        name = input("Enter user's full name: ").strip()
    if not email:
        email = input("Enter user's email: ").strip()
    if not password:
        import getpass
        password = getpass.getpass("Enter password: ").strip()
        confirm = getpass.getpass("Confirm password: ").strip()
        if password != confirm:
            print("Error: Passwords do not match.")
            sys.exit(1)

    if not name or not email or not password:
        print("Error: All fields (name, email, password) are required.")
        sys.exit(1)

    create_admin_user(name, email, password, role)


if __name__ == "__main__":
    main()
