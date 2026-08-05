import React, { useState, useEffect, useRef } from 'react';
import {
  Send, ChevronRight, MessageSquare,
  RefreshCw, CheckCircle2, Zap, Brain, Code2,
  Users, Building2, Star, AlertCircle, Lightbulb,
  Clock, Play, BookOpen, Flame
} from 'lucide-react';
import { callAI } from '../../services/api';
import api from '../../services/api';

const CATEGORIES = [
  { id: 'hr',            label: 'HR',            icon: Users,    color: '#a78bfa' },
  { id: 'technical',     label: 'Technical',     icon: Code2,    color: '#38bdf8' },
  { id: 'behavioral',    label: 'Behavioral',    icon: Brain,    color: '#f472b6' },
  { id: 'system_design', label: 'System Design', icon: Zap,      color: '#fb923c' },
  { id: 'dream_company', label: 'Dream Company', icon: Building2,color: '#4ade80' },
];

const DIFFICULTY = ['Easy', 'Medium', 'Hard', 'Pressure'];

const DREAM_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Zoho', 'Freshworks', 'TCS', 'Infosys', 'Wipro'
];

const STAR_LABELS = {
  S: { label: 'Situation', color: '#a78bfa' },
  T: { label: 'Task',      color: '#38bdf8' },
  A: { label: 'Action',    color: '#4ade80' },
  R: { label: 'Result',    color: '#fb923c' },
};

const scoreColor = (s) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';

const buildSystemPrompt = (category, difficulty, company, pressureMode) => `
You are ANVIORA's elite AI Interview Coach — brutally honest, razor-sharp, and deeply expert.
You evaluate interview answers for ${category} interviews${company ? ` targeting ${company}` : ''}.
Difficulty: ${difficulty}.${pressureMode ? ' PRESSURE MODE: be extra critical.' : ''}

Respond ONLY with a JSON object — no markdown, no preamble. Schema:
{
  "score": <0-100 integer>,
  "verdict": "<one bold sentence: pass/needs work/fail>",
  "star_breakdown": { "S": <0-25>, "T": <0-25>, "A": <0-25>, "R": <0-25> },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "followup_question": "<one sharp follow-up>",
  "model_answer_hint": "<one sentence hinting at ideal structure>",
  "confidence_signal": "<low|medium|high>"
}
`;

const buildQuestionPrompt = (category, difficulty, company, count) => `
Generate ${count} realistic interview questions for category: ${category}${company ? `, targeting ${company}` : ''}.
Difficulty: ${difficulty}.
Respond ONLY with a JSON array — no markdown. Each item:
{
  "id": "<unique string>",
  "text": "<question>",
  "hint": "<one coaching tip>",
  "type": "<hr|technical|behavioral|system_design|coding>",
  "estimated_minutes": <1-5>
}
`;

const ScoreRing = ({ score, size = 80 }) => {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const col = scoreColor(score || 0);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color,#2e354f)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - fill} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size/2} y={size/2 + 6} textAnchor="middle"
        style={{ fill: col, fontSize: size * 0.22, fontWeight: 800, fontFamily: 'system-ui' }}>
        {score ?? '—'}
      </text>
    </svg>
  );
};

const StarBar = ({ label, value, max = 25, color }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{value}/{max}</span>
    </div>
    <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value/max)*100}%`, background: color, borderRadius: 99, transition: 'width 0.7s ease' }} />
    </div>
  </div>
);

const Chip = ({ label, color, icon: Icon }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
    background: `${color}18`, color, border: `1px solid ${color}40` }}>
    {Icon && <Icon size={10} />}{label}
  </span>
);

// ─── SESSION STATE stored in ref so it survives re-renders ───────────────────
const INITIAL_SESSION = {
  questions: [],
  currentIndex: 0,
  answer: '',
  feedback: null,
  sessionScores: [],
  sessionAnswers: [],
  showFollowup: false,
  followupAnswer: '',
  followupFeedback: null,
  timer: 0,
  timerActive: false,
  streak: 0,
  saveStatus: null,
  loading: false,
  submitting: false,
  phase: 'config', // 'config' | 'session' | 'complete'
};

const InterviewCoach = () => {
  const [category,     setCategory]     = useState('hr');
  const [difficulty,   setDifficulty]   = useState('Medium');
  const [company,      setCompany]      = useState('');
  const [pressureMode, setPressureMode] = useState(false);

  // All session state in one object to prevent partial resets
  const [session, setSession] = useState(INITIAL_SESSION);

  // Use ref for timer so it doesn't cause issues with stale closures
  const timerRef   = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Timer effect
  useEffect(() => {
    if (session.timerActive) {
      timerRef.current = setInterval(() => {
        setSession(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [session.timerActive]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const callClaude = async (userPrompt, systemPrompt) => {
    const text = await callAI(userPrompt, systemPrompt);
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  };

  const loadQuestions = async () => {
    setSession(prev => ({ ...INITIAL_SESSION, loading: true, phase: 'session' }));
    try {
      const list = await callClaude(
        'Generate interview questions now.',
        buildQuestionPrompt(category, difficulty, company, 5)
      );
      setSession(prev => ({
        ...prev,
        loading: false,
        questions: Array.isArray(list) ? list : [],
      }));
    } catch (e) {
      console.error(e);
      setSession(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStartAnswer = () => {
    setSession(prev => ({ ...prev, timer: 0, timerActive: true }));
  };

  const handleSubmit = async () => {
    const { answer, submitting, questions, currentIndex, sessionScores, sessionAnswers, timer } = sessionRef.current;
    if (!answer.trim() || submitting) return;

    setSession(prev => ({ ...prev, timerActive: false, submitting: true, feedback: null }));

    try {
      const result = await callClaude(
        `Question: "${questions[currentIndex]?.text}"\n\nCandidate's answer: "${answer}"\n\nTime taken: ${formatTime(timer)}`,
        buildSystemPrompt(category, difficulty, company, pressureMode)
      );

      const score     = result.score ?? 0;
      const newScores = [...sessionScores, score];
      const newAnswers = [...sessionAnswers, {
        question_text: questions[currentIndex]?.text ?? '',
        answer_text:   answer,
        score,
        verdict:       result.verdict ?? '',
        improvements:  result.improvements ?? [],
        strengths:     result.strengths ?? [],
        time_taken:    formatTime(timer),
      }];

      const isLast  = currentIndex === questions.length - 1;
      const overall = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);

      setSession(prev => ({
        ...prev,
        submitting:     false,
        feedback:       result,
        sessionScores:  newScores,
        sessionAnswers: newAnswers,
        streak:         score >= 70 ? prev.streak + 1 : 0,
        phase:          isLast ? 'complete' : 'session',
        saveStatus:     isLast ? 'saving' : null,
      }));

      // Save to DB if last question — fully async, won't affect state
      if (isLast) {
        try {
          await api.post('/interview/save-session', {
            category,
            difficulty,
            company:       company || null,
            overall_score: overall,
            answers:       newAnswers,
          });
          setSession(prev => ({ ...prev, saveStatus: 'saved' }));
        } catch (e) {
          console.error('Save failed:', e);
          setSession(prev => ({ ...prev, saveStatus: 'error' }));
        }
      }
    } catch (e) {
      console.error(e);
      setSession(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleFollowupSubmit = async () => {
    const { followupAnswer, questions, currentIndex, feedback } = sessionRef.current;
    if (!followupAnswer.trim()) return;
    setSession(prev => ({ ...prev, submitting: true }));
    try {
      const result = await callClaude(
        `Original question: "${questions[currentIndex]?.text}"\nFollow-up: "${feedback?.followup_question}"\nAnswer: "${followupAnswer}"`,
        buildSystemPrompt(category, difficulty, company, pressureMode)
      );
      setSession(prev => ({ ...prev, submitting: false, followupFeedback: result }));
    } catch (e) {
      console.error(e);
      setSession(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleNext = () => {
    setSession(prev => ({
      ...prev,
      currentIndex:     prev.currentIndex + 1,
      answer:           '',
      feedback:         null,
      followupFeedback: null,
      showFollowup:     false,
      followupAnswer:   '',
      timer:            0,
      timerActive:      false,
    }));
  };

  const { questions, currentIndex, answer, feedback, sessionScores, showFollowup,
    followupAnswer, followupFeedback, timer, timerActive, streak, saveStatus,
    loading, submitting, phase } = session;

  const avgScore  = sessionScores.length
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : null;
  const catMeta   = CATEGORIES.find(c => c.id === category);
  const isComplete = phase === 'complete';

  const S = {
    root:  { minHeight: '100vh', color: 'var(--text-primary,#e2e8f0)', fontFamily: 'inherit', padding: '24px 20px 48px' },
    card:  { background: 'var(--bg-secondary,#12141c)', border: '1px solid var(--border-color,#2e354f)', borderRadius: 16, padding: '20px 22px' },
    label: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted,#64748b)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'block' },
    btn:   (active, color = '#8b5cf6') => ({
      flex: 1, padding: '9px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
      border: active ? `1px solid ${color}` : '1px solid var(--border-color,#2e354f)',
      background: active ? `${color}22` : 'transparent',
      color: active ? color : 'var(--text-muted,#64748b)', transition: 'all 0.2s',
    }),
    primaryBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 10,
      fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', border: 'none',
      background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', color: '#fff', transition: 'opacity 0.2s',
    },
    textarea: {
      width: '100%', minHeight: 130, background: 'var(--bg-tertiary,#191c28)',
      border: '1px solid var(--border-color,#2e354f)', borderRadius: 10,
      padding: '13px 15px', color: 'var(--text-primary,#f8fafc)', fontSize: '0.875rem',
      resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
    },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20 },
  };

  return (
    <div style={S.root}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            AI Interview Coach
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Simulate real interviews · Get AI feedback · Track your growth
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {avgScore !== null && (
            <div style={{ ...S.card, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SESSION AVG</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreColor(avgScore) }}>{avgScore}</div>
            </div>
          )}
          {streak > 0 && (
            <div style={{ ...S.card, padding: '10px 18px', textAlign: 'center', borderColor: '#fb923c40' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>STREAK</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={18} />{streak}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Config */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18, marginBottom: 18 }}>
          <div>
            <span style={S.label}>Interview Type</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  style={{ ...S.btn(category === c.id, c.color), flex: 'none', padding: '7px 12px' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={S.label}>Difficulty</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {DIFFICULTY.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={S.btn(difficulty === d, d === 'Pressure' ? '#f87171' : '#a78bfa')}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={S.label}>Dream Company (optional)</span>
            <select value={company} onChange={e => setCompany(e.target.value)}
              style={{ ...S.textarea, minHeight: 'unset', padding: '9px 12px', cursor: 'pointer' }}>
              <option value="">Any company</option>
              {DREAM_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: pressureMode ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>
            <div onClick={() => setPressureMode(p => !p)} style={{ width: 38, height: 20, borderRadius: 99, background: pressureMode ? 'rgba(239,68,68,0.25)' : 'var(--border-color)', border: pressureMode ? '1px solid #ef4444' : '1px solid var(--border-color)', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: 2, left: pressureMode ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: pressureMode ? '#ef4444' : 'var(--text-muted)', transition: 'all 0.2s' }} />
            </div>
            Pressure Mode
          </label>
          <button onClick={loadQuestions} disabled={loading} style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}>
            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Play size={14} /> Start Session</>}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {questions.length === 0 && !loading && (
        <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
          <Brain size={40} style={{ color: 'var(--border-color)', marginBottom: 16 }} />
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Configure your session and hit <strong style={{ color: '#8b5cf6' }}>Start Session</strong>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <>
          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} />{formatTime(timer)}
                {feedback && <Chip label={`${feedback.confidence_signal?.toUpperCase()} CONFIDENCE`} color={feedback.confidence_signal === 'high' ? '#4ade80' : feedback.confidence_signal === 'medium' ? '#fbbf24' : '#f87171'} />}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100}%`, background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {sessionScores.map((s, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: `${scoreColor(s)}30`, border: `1px solid ${scoreColor(s)}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: scoreColor(s) }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div style={S.grid2}>
            {/* Left: Question + Answer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Question */}
              <div style={{ ...S.card, borderColor: `${catMeta?.color}30` }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip label={questions[currentIndex]?.type?.replace('_',' ').toUpperCase()} color={catMeta?.color} />
                  <Chip label={difficulty.toUpperCase()} color={difficulty === 'Pressure' ? '#f87171' : '#fbbf24'} />
                  {company && <Chip label={company} color='#4ade80' icon={Building2} />}
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />~{questions[currentIndex]?.estimated_minutes} min
                  </span>
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.55, margin: '0 0 14px', color: 'var(--text-primary)' }}>
                  "{questions[currentIndex]?.text}"
                </p>
                <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Lightbulb size={14} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: 1 }} />
                  <span><strong style={{ color: '#8b5cf6' }}>Coach hint:</strong> {questions[currentIndex]?.hint}</span>
                </div>
              </div>

              {/* Answer */}
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={S.label}>Your Answer</span>
                  {!timerActive && !feedback && (
                    <button onClick={handleStartAnswer} style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>
                      ▶ Start Timer
                    </button>
                  )}
                  {timerActive && (
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', animation: 'pulse 1s infinite' }} />
                      {formatTime(timer)}
                    </span>
                  )}
                </div>
                <textarea
                  placeholder="Structure your answer using STAR: Situation → Task → Action → Result."
                  value={answer}
                  onChange={e => setSession(prev => ({ ...prev, answer: e.target.value }))}
                  style={S.textarea}
                  disabled={!!feedback}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={handleSubmit}
                    disabled={submitting || !answer.trim() || !!feedback}
                    style={{ ...S.primaryBtn, opacity: (submitting || !answer.trim() || !!feedback) ? 0.5 : 1 }}>
                    {submitting ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Evaluating...</> : <><Send size={14} />Submit Answer</>}
                  </button>
                </div>
              </div>

              {/* Follow-up */}
              {feedback && feedback.followup_question && (
                <div style={{ ...S.card, borderColor: 'rgba(251,146,60,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fb923c' }}>⚡ AI FOLLOW-UP</span>
                    {!showFollowup && (
                      <button onClick={() => setSession(prev => ({ ...prev, showFollowup: true }))}
                        style={{ fontSize: '0.75rem', color: '#fb923c', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>
                        Answer it
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.5 }}>
                    "{feedback.followup_question}"
                  </p>
                  {showFollowup && (
                    <div style={{ marginTop: 14 }}>
                      <textarea placeholder="Answer the follow-up..." value={followupAnswer}
                        onChange={e => setSession(prev => ({ ...prev, followupAnswer: e.target.value }))}
                        style={{ ...S.textarea, minHeight: 80 }} />
                      {!followupFeedback && (
                        <button onClick={handleFollowupSubmit} disabled={submitting || !followupAnswer.trim()}
                          style={{ ...S.primaryBtn, marginTop: 10, opacity: (submitting || !followupAnswer.trim()) ? 0.5 : 1 }}>
                          <Send size={13} />Submit
                        </button>
                      )}
                      {followupFeedback && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: '#4ade80' }}>Score: {followupFeedback.score}/100 — </strong>
                          {followupFeedback.verdict}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Feedback */}
            <div>
              {!feedback && !submitting && (
                <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
                  <MessageSquare size={36} style={{ color: 'var(--border-color)', marginBottom: 14 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Submit your answer to get<br />instant AI coach feedback
                  </p>
                </div>
              )}
              {submitting && !feedback && (
                <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
                  <RefreshCw size={30} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 16px' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Analysing your answer…
                  </p>
                </div>
              )}
              {feedback && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  <div style={{ ...S.card, display: 'flex', gap: 18, alignItems: 'center' }}>
                    <ScoreRing score={feedback.score} size={88} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>AI VERDICT</div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>{feedback.verdict}</p>
                      <div style={{ marginTop: 8 }}>
                        <Chip label={`${feedback.confidence_signal?.toUpperCase()} CONFIDENCE`}
                          color={feedback.confidence_signal === 'high' ? '#4ade80' : feedback.confidence_signal === 'medium' ? '#fbbf24' : '#f87171'} />
                      </div>
                    </div>
                  </div>

                  {feedback.star_breakdown && (
                    <div style={S.card}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={12} />STAR BREAKDOWN
                      </div>
                      {Object.entries(STAR_LABELS).map(([k, v]) => (
                        <StarBar key={k} label={v.label} color={v.color} value={feedback.star_breakdown[k] ?? 0} />
                      ))}
                    </div>
                  )}

                  {feedback.strengths?.length > 0 && (
                    <div style={S.card}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={12} />STRENGTHS
                      </div>
                      {feedback.strengths.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', flexShrink: 0, marginTop: 7 }} />
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {feedback.improvements?.length > 0 && (
                    <div style={S.card}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={12} />IMPROVEMENTS
                      </div>
                      {feedback.improvements.map((imp, i) => (
                        <div key={i} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', padding: '8px 12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, marginBottom: 8, lineHeight: 1.5 }}>
                          {imp}
                        </div>
                      ))}
                    </div>
                  )}

                  {feedback.model_answer_hint && (
                    <div style={{ ...S.card, borderColor: 'rgba(8,145,178,0.2)', background: 'rgba(8,145,178,0.04)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BookOpen size={12} />IDEAL ANSWER DIRECTION
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{feedback.model_answer_hint}</p>
                    </div>
                  )}

                  <div>
                    {!isComplete ? (
                      <button onClick={handleNext} style={{ ...S.primaryBtn, width: '100%', justifyContent: 'center' }}>
                        Next Question <ChevronRight size={15} />
                      </button>
                    ) : (
                      <div style={{ padding: '18px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80', marginBottom: 6 }}>
                          <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                          Session complete! Avg: {avgScore}/100
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 14 }}>
                          {saveStatus === 'saving' && <span style={{ color: '#fbbf24' }}><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: 4 }} />Saving to history…</span>}
                          {saveStatus === 'saved'  && <span style={{ color: '#4ade80' }}><CheckCircle2 size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Saved to your history!</span>}
                          {saveStatus === 'error'  && <span style={{ color: '#f87171' }}><AlertCircle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Could not save — check connection.</span>}
                        </div>
                        <button onClick={loadQuestions} style={{ ...S.primaryBtn, margin: '0 auto' }}>
                          <RefreshCw size={13} />New Session
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); }    to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        * { box-sizing: border-box; }
        select option { background: var(--bg-secondary,#fff); color: var(--text-primary,#111); }
        textarea:focus { border-color: rgba(124,58,237,0.4) !important; outline: none; }
      `}</style>
    </div>
  );
};

export default InterviewCoach;
