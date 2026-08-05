from google import genai
from dotenv import load_dotenv
import os

from pathlib import Path

# Resolve project root dynamically to find the .env file
project_root = Path(__file__).resolve().parent.parent
dotenv_path = project_root / ".env"
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

for model in client.models.list():
    print(model.name)