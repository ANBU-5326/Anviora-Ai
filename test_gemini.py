import asyncio
from ai.llm.gemini_client import ask_gemini

async def test():
    response = await ask_gemini("Say hello in one sentence")
    print(response)

asyncio.run(test())