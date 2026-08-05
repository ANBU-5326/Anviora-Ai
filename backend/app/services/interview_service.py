import json
import random
from typing import List


QUESTION_BANK = {
    "frontend": [
        {"id": 1, "text": "Explain the difference between Virtual DOM and Shadow DOM.", "hint": "Think about React's rendering strategy vs Web Components encapsulation."},
        {"id": 2, "text": "What is event delegation and how does it improve performance?", "hint": "Think about bubbling, event.target, and avoiding memory leaks from many listeners."},
        {"id": 3, "text": "How do you optimize a React application rendering large datasets?", "hint": "Mention virtualization (react-window), memoization (useMemo, React.memo), and component splitting."},
        {"id": 4, "text": "Explain the CSS Box Model and how box-sizing affects it.", "hint": "content-box vs border-box, and how padding/border are calculated."},
        {"id": 5, "text": "What are the key differences between REST and GraphQL APIs?", "hint": "Over-fetching, under-fetching, strong typing, and single endpoint."},
    ],
    "backend": [
        {"id": 1, "text": "How do you design a database schema for a scalable application?", "hint": "Discuss normalization, indexing, partitioning strategies, and read-replicas."},
        {"id": 2, "text": "What are the main differences between SQL and NoSQL databases?", "hint": "Schema strictness, ACID properties, scaling characteristics, and use cases."},
        {"id": 3, "text": "How does connection pooling work in backend services?", "hint": "Socket reuse, resource caps, pool exhaustion handling, and performance benefits."},
        {"id": 4, "text": "Explain JWT authentication flow end-to-end.", "hint": "Token generation, signing, expiry, refresh tokens, and secure storage."},
        {"id": 5, "text": "What is the N+1 query problem and how do you solve it?", "hint": "Eager loading, JOIN queries, and ORM select_related / joinedload."},
    ],
    "behavioral": [
        {"id": 1, "text": "Tell me about a time you had a conflict with a teammate and how you resolved it.", "hint": "Use the STAR method: Situation, Task, Action, Result. Focus on collaboration."},
        {"id": 2, "text": "Describe the most complex technical challenge you've faced and how you overcame it.", "hint": "Focus on your analytical approach, what you learned, and the outcome."},
        {"id": 3, "text": "Tell me about a project you're most proud of and why.", "hint": "Describe impact, your specific contribution, technical decisions, and lessons learned."},
        {"id": 4, "text": "How do you handle a situation when you're given an unrealistic deadline?", "hint": "Discuss prioritization, negotiation, scope management, and stakeholder communication."},
        {"id": 5, "text": "Describe a time you had to learn a new technology quickly.", "hint": "Show your learning process, resources you used, and how you applied the knowledge."},
    ],
    "system": [
        {"id": 1, "text": "Design a URL shortening service like bit.ly.", "hint": "Hash function, collision handling, DB schema, redirect flow, and analytics."},
        {"id": 2, "text": "Design a distributed notification system.", "hint": "Message queues, fan-out, delivery guarantees, retry logic, and rate limiting."},
        {"id": 3, "text": "How would you design Twitter's feed system?", "hint": "Push vs pull model, fanout-on-write, caching hot feeds, and eventual consistency."},
    ],
}


def get_questions(category: str) -> List[dict]:
    return QUESTION_BANK.get(category, QUESTION_BANK["frontend"])


def evaluate_answer(question_text: str, answer_text: str) -> dict:
    """
    Evaluate an interview answer. Returns score, feedback, and improvement tips.
    This is rule-based — upgrade to LLM for production.
    """
    answer = answer_text.strip()

    if len(answer) < 15:
        return {
            "score": 35,
            "feedback": "Your answer is too brief. Strong interview answers should elaborate with technical context, specific examples, and explain the 'why' behind decisions.",
            "improvements": [
                "Expand your answer with a concrete example from your experience.",
                "Include relevant technical terminology to demonstrate expertise.",
                "Explain trade-offs or alternative approaches you considered.",
            ],
        }

    word_count = len(answer.split())

    # Score based on answer quality signals
    score = 60
    improvements = []

    # Reward longer, more detailed answers
    if word_count > 50:
        score += 10
    if word_count > 100:
        score += 10

    # Check for key technical signals
    tech_signals = ["because", "however", "trade-off", "example", "performance", "scale", "optimize", "implement"]
    signal_count = sum(1 for s in tech_signals if s.lower() in answer.lower())
    score += min(15, signal_count * 3)

    # Cap at 95
    score = min(95, score)
    score += random.randint(-3, 5)

    if word_count < 50:
        improvements.append("Provide more detail — a complete answer should be 50–150 words.")
    if "example" not in answer.lower():
        improvements.append("Include a real-world example or a project where you applied this concept.")
    improvements.append("Consider discussing trade-offs or edge cases for a stronger answer.")

    feedbacks = [
        f"Good response! You covered the key concepts clearly. Score: {score}/100. Your answer demonstrated technical understanding with good structure.",
        f"Solid answer demonstrating real knowledge. Score: {score}/100. The explanation was coherent and touched on important aspects.",
        f"Well-structured response! Score: {score}/100. You addressed the core of the question and showed practical awareness.",
    ]

    return {
        "score": score,
        "feedback": random.choice(feedbacks),
        "improvements": improvements[:3],
    }
