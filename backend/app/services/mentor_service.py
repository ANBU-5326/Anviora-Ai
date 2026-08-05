from datetime import datetime


# Keyword-rule based AI mentor responses
# This is designed to be easily swapped for Gemini/OpenAI when API key is ready

TOPIC_RESPONSES = {
    "react": "For React mastery, focus on: (1) Deep understanding of the rendering cycle and reconciliation, (2) Custom hooks for reusable logic, (3) State management patterns — Context API for simple, Zustand/Redux Toolkit for complex apps. Always optimize renders with useMemo and useCallback strategically.",
    "vue": "Vue.js is excellent for rapid development. Study the Composition API (Vue 3), Pinia for state management, and Vue Router. The reactivity system is more magical but also more intuitive than React's manual optimization.",
    "frontend": "Frontend engineering in 2025 means: mastering React/Next.js, understanding performance metrics (Core Web Vitals, LCP, CLS), CSS architecture (BEM or CSS Modules), and TypeScript. Accessibility (WCAG 2.1) is now a must for top companies.",
    "python": "Python is everywhere — web (FastAPI/Django), data science, AI/ML. Focus on: clean Pythonic code, async/await patterns, decorators, and generators. For backend, FastAPI is the modern standard. Learn SQLAlchemy for database ORM.",
    "java": "Java remains dominant in enterprise and Android. Focus on: OOP principles, Java 17+ features (records, sealed classes, pattern matching), Spring Boot for web, and JVM performance tuning. For interviews, master collections and concurrent programming.",
    "backend": "Backend engineering requires: (1) RESTful API design principles (idempotency, status codes, versioning), (2) Database design — normalization, indexing, query optimization, (3) Authentication — JWT, OAuth2, session management, (4) Caching with Redis, (5) Message queues (RabbitMQ/Kafka) for async processing.",
    "resume": "A strong engineering resume: (1) One page for <5 years experience, (2) Use strong action verbs: Architected, Engineered, Optimized, Reduced, (3) Quantify everything — '40% faster load time', 'served 10k+ users', (4) Tailor skills section to job description keywords for ATS, (5) Put GitHub link and portfolio prominently.",
    "job": "Job search strategy: (1) Apply to 5–10 positions per week, not 100 blindly, (2) Customize your resume cover letter per company, (3) Leverage LinkedIn, alumni network, and referrals (3x interview rate), (4) Prepare STAR stories for behavioral questions, (5) Research the company's tech stack and mention it.",
    "interview": "Technical interview preparation: (1) LeetCode — solve 100+ problems (focus on arrays, trees, graphs, DP), (2) System design — study distributed systems, load balancing, caching, (3) Behavioral — prepare 6–8 STAR stories covering conflict, failure, success, leadership, (4) Mock interviews with friends or Pramp, (5) Communicate your thinking out loud.",
    "dsa": "Data structures and algorithms study path: Week 1-2: Arrays, Strings, Hashing. Week 3-4: Linked Lists, Stacks, Queues. Week 5-6: Trees, BST, Graphs. Week 7-8: Dynamic Programming, Greedy. Practice 2-3 LeetCode problems daily. Use NeetCode 150 as your guide.",
    "system": "System design fundamentals: (1) Start with requirements clarification and scale estimation, (2) Design API contracts first, (3) Pick SQL vs NoSQL based on data shape and consistency needs, (4) Add a CDN for static assets, (5) Use caching (Redis) for hot data, (6) Consider eventual consistency for high scale. Study: URL shortener, Twitter feed, YouTube, Uber.",
    "ml": "For ML/AI: Start with Python NumPy/Pandas, then Scikit-learn for classical ML (regression, classification, clustering). Then move to deep learning with PyTorch or TensorFlow. Study transformers and fine-tuning for LLM applications. Kaggle competitions are excellent for practical experience.",
    "project": "Strong portfolio projects: (1) Build something you'd actually use — problems you've faced, (2) Include a real-time feature (WebSockets), (3) Deploy on cloud (Vercel/Railway/AWS), (4) Add authentication and database persistence, (5) Write a clear README with architecture diagram, screenshots, and setup instructions. Recruiters spend 30 seconds on each project.",
    "placement": "Placement preparation timeline: 6 months before: Start DSA and build 2-3 strong projects. 3 months before: Apply early, attend campus drives, optimize resume. 1 month before: Mock interviews daily, HR round practice. Day of: Sleep well, carry printed resume copies, have questions ready for interviewer.",
}

GENERAL_RESPONSES = [
    "That's a great question! The key to consistent growth in software engineering is deliberate practice — not just coding, but reflecting on what you build and why. What specific area would you like to explore further?",
    "Understanding system design is crucial as you advance from junior to senior levels. I suggest studying how load balancers, caching layers, and database replicas work together. Want me to dive into any specific component?",
    "Don't underestimate the importance of soft skills. Communication, documentation, and code review etiquette distinguish good engineers from great ones. What's your current experience with team collaboration?",
    "The best developers I know are not the fastest coders — they're the clearest thinkers. Focus on problem decomposition before writing a single line. Can you tell me more about what you're working on?",
    "Consistency beats intensity. Solving 2 problems daily for a year (730 problems) is far more effective than grinding 50 in one weekend. How is your current daily study habit structured?",
]


def generate_mentor_reply(message: str) -> str:
    """
    Generate an intelligent keyword-matched response for the AI mentor.
    Designed to be replaced by Gemini/OpenAI when API key is available.
    """
    lower = message.lower()

    # Check topic matches (ordered by specificity)
    for keyword, response in TOPIC_RESPONSES.items():
        if keyword in lower:
            return response

    # Fallback to general motivational / guidance responses
    import random
    return random.choice(GENERAL_RESPONSES)


def format_timestamp() -> str:
    return datetime.utcnow().strftime("%H:%M")
