import asyncio
import sys
import os

# Put backend dir in path
backend_dir = os.path.join(os.getcwd(), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ai.llm.gemini_client import ask_gemini

async def test():
    try:
        response = await ask_gemini("Say hello in one sentence")
        with open("test_ai.log", "w") as f:
            f.write(f"SUCCESS: {response}\n")
        print("Success written to log")
    except Exception as e:
        with open("test_ai.log", "w") as f:
            f.write(f"ERROR: {str(e)}\n")
        print("Error written to log")

if __name__ == "__main__":
    asyncio.run(test())
