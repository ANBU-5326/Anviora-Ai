import os
import shutil

# Path references
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
db_path = os.path.join(base_dir, "backend", "anviora.db")
uploads_dir = os.path.join(base_dir, "backend", "uploads")


def clean_project():
    print("Starting cleanup process...")

    # 1. Delete SQLite database
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"Removed database file: {db_path}")
        except Exception as e:
            print(f"Error removing database file: {e}")
    else:
        print("No database file found to remove.")

    # 2. Clean uploads folder
    if os.path.exists(uploads_dir):
        print(f"Cleaning uploads folder: {uploads_dir}")
        for item in os.listdir(uploads_dir):
            item_path = os.path.join(uploads_dir, item)
            if item == ".gitkeep":
                continue
            try:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
                print(f"Removed: {item}")
            except Exception as e:
                print(f"Error removing {item}: {e}")
    else:
        print("Uploads folder does not exist.")

    print("Cleanup completed successfully.")


if __name__ == "__main__":
    clean_project()
