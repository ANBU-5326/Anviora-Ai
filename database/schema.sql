-- ANVIORA AI Database Schema (SQLite Compatible)
-- Automatically managed by SQLAlchemy in the backend application

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Student',
    bio TEXT DEFAULT '',
    avatar VARCHAR(10) DEFAULT 'US',
    college VARCHAR(200) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    year VARCHAR(20) DEFAULT '',
    git_nickname VARCHAR(100) DEFAULT '',
    skills_json TEXT DEFAULT '[]',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score INTEGER DEFAULT 50,
    industry_avg INTEGER DEFAULT 60,
    full_mark INTEGER DEFAULT 100,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(100) DEFAULT '',
    duration VARCHAR(50) DEFAULT '',
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Study Tasks Table
CREATE TABLE IF NOT EXISTS study_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'mentor'
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- 6. Coding Stats Table
CREATE TABLE IF NOT EXISTS coding_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    solved_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 800,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    rank VARCHAR(20) DEFAULT 'N/A',
    last_submission_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Coding Submissions Table
CREATE TABLE IF NOT EXISTS coding_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stats_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
    status VARCHAR(50) DEFAULT 'Accepted',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stats_id) REFERENCES coding_stats(id) ON DELETE CASCADE
);

-- 8. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) DEFAULT 'frontend', -- 'frontend', 'backend', 'behavioral'
    overall_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Interview Answers Table
CREATE TABLE IF NOT EXISTS interview_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT DEFAULT '',
    score INTEGER DEFAULT 0,
    feedback TEXT DEFAULT '',
    improvements_json TEXT DEFAULT '[]',
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- 10. Placement Applications Table
CREATE TABLE IF NOT EXISTS placement_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company VARCHAR(200) NOT NULL,
    role VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'Applied', -- 'Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'
    date_applied VARCHAR(20) DEFAULT '',
    salary VARCHAR(100) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'reminder', 'alert', 'ai_suggestion'
    title VARCHAR(200) NOT NULL,
    message TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) DEFAULT '',
    ats_score INTEGER DEFAULT 0,
    impact_score INTEGER DEFAULT 0,
    grammar_score INTEGER DEFAULT 0,
    brevity_score INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,
    positives_json TEXT DEFAULT '[]',
    improvements_json TEXT DEFAULT '[]',
    keyword_match_json TEXT DEFAULT '[]',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
