import os
import shutil
from datetime import datetime

# Path references
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
db_path = os.path.join(base_dir, "backend", "anviora.db")
backup_dir = os.path.join(base_dir, "database", "backup")


def backup_db():
    if not os.path.exists(db_path):
        print(f"Error: Database file does not exist at {db_path}")
        return

    # Create backup directory if it doesn't exist
    os.makedirs(backup_dir, exist_ok=True)

    # Generate timestamped backup file name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"anviora_backup_{timestamp}.db")

    try:
        shutil.copy2(db_path, backup_file)
        print(f"Success: Database backup created successfully at: {backup_file}")
    except Exception as e:
        print(f"Error creating database backup: {e}")


if __name__ == "__main__":
    backup_db()
