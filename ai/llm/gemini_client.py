import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq

# Resolve project root dynamically to find the .env file
project_root = Path(__file__).resolve().parent.parent.parent
dotenv_path = project_root / ".env"
load_dotenv(dotenv_path=dotenv_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY)

PRIMARY_MODEL = "llama-3.1-8b-instant"
FALLBACK_MODELS = ["llama-3.3-70b-versatile", "llama3-8b-8192"]


def _sync_chat(messages: list) -> str:
    """Synchronous Groq call — run this in a thread pool, never directly in async."""
    models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
    last_exception = None
    for model in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,
            )
            return response.choices[0].message.content
        except Exception as e:
            last_exception = e
            continue
    raise last_exception or Exception("All AI models failed to respond")


async def ask_gemini(prompt: str, system_prompt: str = "") -> str:
    """Single-turn AI call wrapped so it doesn't block FastAPI's event loop."""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await asyncio.to_thread(_sync_chat, messages)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")


async def ask_gemini_with_history(messages: list, system_prompt: str = "") -> str:
    """Multi-turn AI call with full conversation history."""
    try:
        groq_messages = []
        if system_prompt:
            groq_messages.append({"role": "system", "content": system_prompt})
        for msg in messages:
            role = msg.get("role", "user")
            # Groq only accepts 'user', 'assistant', 'system'
            if role not in ("user", "assistant", "system"):
                role = "user"
            groq_messages.append({
                "role": role,
                "content": msg.get("content", ""),
            })
        return await asyncio.to_thread(_sync_chat, groq_messages)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")