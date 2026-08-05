import React, { useState, useEffect, useRef } from 'react';
import { studyService } from '../../services/studyService';
import { callAI } from '../../services/api';
import {
  Calendar, Plus, CheckCircle, Circle, BookOpen, Zap, Target,
  Clock, Flame, Brain, TrendingUp, ChevronDown, ChevronUp,
  Sparkles, MoreHorizontal, Trash2, Play, Pause, RotateCcw,
  AlertTriangle, Star, Award, X, Check
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

// ─── Mock data for local development / demo ─────────────────────────────────
const DEMO_PLANS = [
  {
    id: 1,
    title: 'Master Machine Learning',
    subject: 'AI & Data Science',
    duration: '6 Weeks',
    priority: 'high',
    examDate: '2024-08-15',
    progress: 62,
    streak: 7,
    burnoutScore: 28,
    tasks: [
      { id: 101, text: 'Linear & Logistic Regression', completed: true, difficulty: 'medium' },
      { id: 102, text: 'Decision Trees & Random Forest', completed: true, difficulty: 'medium' },
      { id: 103, text: 'Support Vector Machines', completed: false, difficulty: 'hard' },
      { id: 104, text: 'Neural Networks basics', completed: false, difficulty: 'hard' },
      { id: 105, text: 'Model Evaluation & Cross-validation', completed: false, difficulty: 'medium' },
    ]
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms',
    subject: 'Placement Prep',
    duration: '12 Weeks',
    priority: 'critical',
    examDate: '2024-09-01',
    progress: 38,
    streak: 12,
    burnoutScore: 71,
    tasks: [
      { id: 201, text: 'Arrays & String manipulation', completed: true, difficulty: 'easy' },
      { id: 202, text: 'Linked Lists & Stacks', completed: true, difficulty: 'medium' },
      { id: 203, text: 'Trees & Graph traversal', completed: false, difficulty: 'hard' },
      { id: 204, text: 'Dynamic Programming', completed: false, difficulty: 'hard' },
    ]
  },
  {
    id: 3,
    title: 'Database Management Systems',
    subject: 'Core Subject',
    duration: '4 Weeks',
    priority: 'medium',
    examDate: '2024-07-28',
    progress: 85,
    streak: 5,
    burnoutScore: 18,
    tasks: [
      { id: 301, text: 'ER Diagrams & Normalization', completed: true, difficulty: 'medium' },
      { id: 302, text: 'SQL Joins & Subqueries', completed: true, difficulty: 'medium' },
      { id: 303, text: 'Transactions & ACID', completed: true, difficulty: 'hard' },
      { id: 304, text: 'Indexing & Query Optimization', completed: false, difficulty: 'hard' },
    ]
  }
];

const SUBJECT_OPTIONS = [
  'AI & Data Science', 'Placement Prep', 'Core Subject',
  'Web Development', 'Backend Engineering', 'System Design',
  'Mathematics', 'Computer Networks', 'Operating Systems', 'Other'
];

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.3)' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)' },
  high:     { label: 'High',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.3)' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)' },
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard:   { label: 'Hard',   color: '#ef4444' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const BurnoutIndicator = ({ score }) => {
  const level = score < 30 ? 'good' : score < 60 ? 'moderate' : 'high';
  const config = {
    good:     { label: 'Healthy pace', color: '#22c55e', icon: '🟢' },
    moderate: { label: 'Watch load',   color: '#f59e0b', icon: '🟡' },
    high:     { label: 'Overloaded',   color: '#ef4444', icon: '🔴' },
  }[level];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '52px', height: '5px', borderRadius: '3px',
        background: 'rgba(255,255,255,0.08)', overflow: 'hidden'
      }}>
        <div style={{
          width: `${score}%`, height: '100%', borderRadius: '3px',
          background: config.color, transition: 'width 0.6s ease'
        }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: config.color, fontWeight: 600 }}>{config.label}</span>
    </div>
  );
};

const AIInsightBadge = ({ plan }) => {
  const daysLeft = plan.examDate
    ? Math.max(0, Math.round((new Date(plan.examDate) - new Date()) / 86400000))
    : null;
  const remaining = 100 - plan.progress;
  let message = '';
  if (plan.burnoutScore > 60) message = '⚠️ Reduce daily load — burnout risk detected';
  else if (daysLeft !== null && daysLeft < 7 && plan.progress < 70) message = `🚨 Only ${daysLeft}d left — accelerate revision`;
  else if (plan.streak >= 7) message = `🔥 ${plan.streak}-day streak — momentum is strong`;
  else if (remaining < 20) message = '✅ Almost done — review weak areas today';
  else message = `📊 ${remaining}% remaining — on track`;

  return (
    <div style={{
      fontSize: '0.72rem', padding: '6px 10px', borderRadius: '8px',
      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
      color: 'var(--text-secondary)', lineHeight: 1.4
    }}>
      {message}
    </div>
  );
};

const FocusTimer = ({ planId, onClose }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('focus'); // focus | break
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(ref.current);
            setRunning(false);
            if (phase === 'focus') { setPhase('break'); return 5 * 60; }
            else { setPhase('focus'); return 25 * 60; }
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running, phase]);

  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  const pct = phase === 'focus' ? (1 - seconds / (25 * 60)) * 100 : (1 - seconds / (5 * 60)) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
        borderRadius: '20px', padding: '36px', width: '320px', textAlign: 'center',
        boxShadow: '0 0 60px rgba(139,92,246,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {phase === 'focus' ? '🎯 Focus Session' : '☕ Short Break'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="80" cy="80" r="68" fill="none"
              stroke={phase === 'focus' ? 'var(--accent-purple)' : '#22c55e'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 68}`}
              strokeDashoffset={`${2 * Math.PI * 68 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{m}:{s}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>minutes</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => setRunning(r => !r)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px',
            background: running ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600,
            fontSize: '0.9rem', cursor: 'pointer'
          }}>
            {running ? <><Pause size={16}/> Pause</> : <><Play size={16}/> Start</>}
          </button>
          <button onClick={() => { setSeconds(phase === 'focus' ? 25*60 : 5*60); setRunning(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
            borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer'
          }}>
            <RotateCcw size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── AI Plan Generator Modal ──────────────────────────────────────────────────
const AIPlanModal = ({ onClose, onGenerate }) => {
  const [goal, setGoal] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [weakAreas, setWeakAreas] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setError('');
    const days = examDate ? Math.max(7, Math.round((new Date(examDate) - new Date()) / 86400000)) : 28;
    const weeks = Math.ceil(days / 7);
    const duration = weeks <= 2 ? '2 Weeks' : weeks <= 4 ? '4 Weeks' : weeks <= 6 ? '6 Weeks' : '12 Weeks';

    let aiTasks = [];
    try {
      const systemPrompt = `You are ANVIORA's AI Study Planner. Generate a structured study plan based on the user's inputs. Respond ONLY with a valid JSON array of tasks (no markdown blocks, no preamble, no explanation). Each task object must have: "text" (specific, actionable topic/milestone) and "difficulty" (either "easy", "medium", or "hard"). Example format: [{"text": "Learn basic concepts of ML", "difficulty": "easy"}]`;
      const message = `Goal: ${goal}\nExam Date: ${examDate || 'No exam date specified'}\nFree Hours/Day: ${hoursPerDay}\nWeak Areas to focus: ${weakAreas || 'None specified'}`;
      const response = await callAI(message, systemPrompt);
      const cleanJson = response.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        aiTasks = parsed.map((t, i) => ({
          id: Date.now() + i,
          completed: false,
          text: t.text || `Task ${i + 1}`,
          difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium'
        }));
      } else {
        throw new Error('Response is not an array');
      }
    } catch (e) {
      console.error('Failed to generate AI study plan', e);
      setError('Failed to reach AI server or parse the study plan. Please ensure the backend is running on http://localhost:8000.');
      setGenerating(false);
      return;
    }

    onGenerate({
      title: goal,
      subject: 'AI Generated',
      duration,
      priority: days < 14 ? 'critical' : days < 30 ? 'high' : 'medium',
      examDate: examDate || null,
      progress: 0,
      streak: 0,
      burnoutScore: 15,
      tasks: aiTasks,
    });
    setGenerating(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: '20px', padding: '32px', width: '480px', maxWidth: '95vw',
        boxShadow: '0 0 80px rgba(139,92,246,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Study Plan Generator</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              ANVIORA builds your plan intelligently based on your inputs
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>What do you want to master?</label>
            <input
              placeholder="e.g. Machine Learning, DBMS, React.js..."
              value={goal} onChange={e => setGoal(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Exam / deadline date</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Free hours per day</label>
              <select value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} style={inputStyle}>
                {['1','2','3','4','5','6'].map(h => <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Weak areas to focus on (optional)</label>
            <input
              placeholder="e.g. Backpropagation, SQL Joins..."
              value={weakAreas} onChange={e => setWeakAreas(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.8rem', marginTop: '16px', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!goal.trim() || generating}
          style={{
            marginTop: '24px', width: '100%', padding: '13px',
            background: generating ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontWeight: 700, fontSize: '0.95rem', cursor: generating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'opacity 0.2s'
          }}
        >
          {generating ? (
            <>
              <div style={{
                width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
              }} />
              ANVIORA is building your plan...
            </>
          ) : (
            <><Sparkles size={16} /> Generate My Study Plan</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.02em'
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
  borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.9rem'
};

// ─── Main PlanCard ────────────────────────────────────────────────────────────
const PlanCard = ({ plan, onToggleTask, onAddTask, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const [taskText, setTaskText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const prio = PRIORITY_CONFIG[plan.priority] || PRIORITY_CONFIG.medium;

  const daysLeft = plan.examDate
    ? Math.max(0, Math.round((new Date(plan.examDate) - new Date()) / 86400000))
    : null;

  return (
    <>
      {timerOpen && <FocusTimer planId={plan.id} onClose={() => setTimerOpen(false)} />}
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border-color)`,
        borderTop: `3px solid ${prio.color}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 1px ${prio.color}44, 0 8px 32px rgba(0,0,0,0.3)`}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Card header */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
                  background: prio.bg, color: prio.color, border: `1px solid ${prio.border}`,
                  letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>{prio.label}</span>
                <span style={{
                  fontSize: '0.68rem', padding: '3px 9px', borderRadius: '20px',
                  background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
                  border: '1px solid rgba(59,130,246,0.2)', fontWeight: 600
                }}>{plan.subject}</span>
                {plan.streak >= 3 && (
                  <span style={{
                    fontSize: '0.68rem', padding: '3px 9px', borderRadius: '20px',
                    background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700
                  }}>🔥 {plan.streak}d streak</span>
                )}
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>{plan.title}</h2>
            </div>

            {/* Menu */}
            <div style={{ position: 'relative', marginLeft: '8px' }}>
              <button onClick={() => setShowMenu(m => !m)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', borderRadius: '6px'
              }}>
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '28px', zIndex: 10,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  borderRadius: '10px', overflow: 'hidden', minWidth: '160px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}>
                  <button onClick={() => { setTimerOpen(true); setShowMenu(false); }} style={menuItemStyle}>
                    <Play size={14} /> Start Focus Timer
                  </button>
                  <button onClick={() => { onDelete(plan.id); setShowMenu(false); }} style={{ ...menuItemStyle, color: '#ef4444' }}>
                    <Trash2 size={14} /> Delete track
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <Clock size={12} /> {plan.duration}
            </div>
            {daysLeft !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem',
                color: daysLeft < 7 ? '#ef4444' : daysLeft < 14 ? '#f59e0b' : 'var(--text-muted)'
              }}>
                <Calendar size={12} />
                {daysLeft === 0 ? 'Due today!' : `${daysLeft}d to exam`}
              </div>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <BurnoutIndicator score={plan.burnoutScore} />
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{plan.progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                background: plan.progress >= 80
                  ? 'linear-gradient(90deg, #22c55e, #10b981)'
                  : plan.progress >= 50
                  ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
                  : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                width: `${plan.progress}%`,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
              }} />
            </div>
          </div>

          {/* AI insight */}
          <div style={{ marginBottom: '16px' }}>
            <AIInsightBadge plan={plan} />
          </div>
        </div>

        {/* Tasks section */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}
          >
            <span>Milestone Tasks ({plan.tasks?.filter(t => t.completed).length}/{plan.tasks?.length})</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {plan.tasks?.length > 0 ? plan.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(plan.id, task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: task.completed ? 'rgba(34,197,94,0.05)' : 'var(--bg-secondary)',
                    border: `1px solid ${task.completed ? 'rgba(34,197,94,0.2)' : 'var(--border-color)'}`,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--accent-purple)'; }}
                  onMouseLeave={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  {task.completed
                    ? <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                    : <Circle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  }
                  <span style={{
                    fontSize: '0.85rem', flex: 1,
                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>{task.text}</span>
                  {task.difficulty && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: DIFFICULTY_CONFIG[task.difficulty]?.color || '#888',
                      opacity: task.completed ? 0.5 : 1
                    }}>
                      {task.difficulty.toUpperCase()}
                    </span>
                  )}
                </div>
              )) : (
                <div style={{
                  textAlign: 'center', padding: '20px', color: 'var(--text-muted)',
                  fontSize: '0.82rem', border: '1px dashed var(--border-color)', borderRadius: '8px'
                }}>
                  No milestones yet — add your first task below
                </div>
              )}

              {/* Add task row */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  placeholder="Add a milestone task..."
                  value={taskText}
                  onChange={e => setTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && taskText.trim()) { onAddTask(plan.id, taskText); setTaskText(''); } }}
                  style={{
                    flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: '7px', padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={() => { if (taskText.trim()) { onAddTask(plan.id, taskText); setTaskText(''); } }}
                  style={{
                    width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--accent-purple)', border: 'none', borderRadius: '7px',
                    color: '#fff', cursor: 'pointer'
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const menuItemStyle = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
  padding: '10px 14px', background: 'none', border: 'none',
  color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.83rem',
  textAlign: 'left', transition: 'background 0.15s'
};

// ─── Main StudyPlanner ────────────────────────────────────────────────────────
const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  // Form state
  const [form, setForm] = useState({
    name: '', subject: SUBJECT_OPTIONS[0], duration: '4 Weeks',
    priority: 'medium', examDate: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studyService.getPlans();
        setPlans(data);
      } catch {
        setPlans([]); // No fallback to demo plans
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleTask = async (planId, taskId) => {
    // Optimistic update
    setPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      const tasks = plan.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const done = tasks.filter(t => t.completed).length;
      return { ...plan, tasks, progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
    }));
    try {
      const updatedPlans = await studyService.toggleTask(planId, taskId);
      if (updatedPlans) setPlans(updatedPlans);
    } catch (err) {
      console.error(err);
      // Revert to database state if update fails
      const data = await studyService.getPlans();
      setPlans(data);
    }
  };

  const handleAddTask = async (planId, text) => {
    try {
      const updatedPlans = await studyService.addTask(planId, text);
      if (updatedPlans) setPlans(updatedPlans);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    try {
      await studyService.deletePlan(planId);
    } catch (e) {
      console.error("Delete plan failed:", e);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newPlan = {
      id: Date.now(), title: form.name, subject: form.subject,
      duration: form.duration, priority: form.priority,
      examDate: form.examDate || null, progress: 0,
      streak: 0, burnoutScore: 10, tasks: []
    };
    setForm({ name: '', subject: SUBJECT_OPTIONS[0], duration: '4 Weeks', priority: 'medium', examDate: '' });
    setShowAddForm(false);
    try {
      await studyService.addPlan(newPlan);
      const data = await studyService.getPlans();
      setPlans(data);
    } catch {
      setPlans(prev => [newPlan, ...prev]);
    }
  };

  const handleAIGenerate = async (plan) => {
    try {
      await studyService.addPlan(plan);
      const data = await studyService.getPlans();
      setPlans(data);
    } catch (e) {
      console.error("AI plan save failed:", e);
    }
  };

  // Filtered + sorted plans
  const filtered = plans
    .filter(p => filterPriority === 'all' || p.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'exam') {
        if (!a.examDate) return 1; if (!b.examDate) return -1;
        return new Date(a.examDate) - new Date(b.examDate);
      }
      if (sortBy === 'streak') return (b.streak || 0) - (a.streak || 0);
      return 0;
    });

  // Summary stats
  const totalPlans = plans.length;
  const avgProgress = totalPlans ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / totalPlans) : 0;
  const totalTasks = plans.reduce((s, p) => s + (p.tasks?.length || 0), 0);
  const doneTasks = plans.reduce((s, p) => s + (p.tasks?.filter(t => t.completed).length || 0), 0);
  const highBurnout = plans.filter(p => p.burnoutScore > 60).length;

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <LoadingSpinner size="md" />
      <span style={{ color: 'var(--accent-purple)', fontSize: '0.9rem', fontWeight: 600 }}>ANVIORA is loading your study tracks...</span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anviora-card-enter { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {showAIModal && <AIPlanModal onClose={() => setShowAIModal(false)} onGenerate={handleAIGenerate} />}

      <div className="fade-in">
        {/* ── Page header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={20} style={{ color: 'var(--accent-purple)' }} />
              <h1 className="page-title" style={{ margin: 0 }}>Study Planner</h1>
            </div>
            <p className="page-description" style={{ margin: 0 }}>
              Build intelligent study tracks. ANVIORA monitors your pace, streak, and burnout risk.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowAIModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
                border: '1px solid rgba(139,92,246,0.4)', borderRadius: '10px',
                color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              <Sparkles size={15} /> AI Generate
            </button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="glow-button"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> New Track
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px', marginBottom: '24px'
        }}>
          {[
            { label: 'Active Tracks', value: totalPlans, icon: <Target size={16}/>, color: 'var(--accent-purple)' },
            { label: 'Avg. Progress', value: `${avgProgress}%`, icon: <TrendingUp size={16}/>, color: 'var(--accent-blue)' },
            { label: 'Tasks Done', value: `${doneTasks}/${totalTasks}`, icon: <Check size={16}/>, color: '#22c55e' },
            { label: 'Burnout Alerts', value: highBurnout, icon: <AlertTriangle size={16}/>, color: highBurnout > 0 ? '#ef4444' : '#22c55e' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color, flexShrink: 0
              }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Add form ── */}
        {showAddForm && (
          <div className="glass-panel anviora-card-enter" style={{ padding: '22px', marginBottom: '24px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Create New Study Track</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreatePlan}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Track title *</label>
                  <input placeholder="e.g. Master DSA" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle}>
                    {SUBJECT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={inputStyle}>
                    {['2 Weeks','4 Weeks','6 Weeks','12 Weeks'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inputStyle}>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Exam date (optional)</label>
                  <input type="date" value={form.examDate}
                    onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="glow-button" style={{ padding: '10px 24px' }}>Create Track</button>
                <button type="button" onClick={() => setShowAddForm(false)} style={{
                  padding: '10px 20px', background: 'none', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Filter + Sort bar ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['all','All'], ['critical','Critical'], ['high','High'], ['medium','Medium']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterPriority(val)} style={{
                padding: '5px 13px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                background: filterPriority === val ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                color: filterPriority === val ? '#fff' : 'var(--text-muted)',
                border: filterPriority === val ? 'none' : '1px solid var(--border-color)',
                transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              ...inputStyle, padding: '5px 10px', fontSize: '0.78rem', width: 'auto'
            }}>
              <option value="progress">Progress</option>
              <option value="exam">Exam date</option>
              <option value="streak">Streak</option>
            </select>
          </div>
        </div>

        {/* ── Plans grid ── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            border: '1px dashed var(--border-color)', borderRadius: '16px'
          }}>
            <Brain size={40} style={{ color: 'var(--accent-purple)', marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              No study tracks yet. Let ANVIORA build your first plan.
            </p>
            <button onClick={() => setShowAIModal(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer'
            }}>
              <Sparkles size={15}/> Generate with AI
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map(plan => (
              <div key={plan.id} className="anviora-card-enter">
                <PlanCard
                  plan={plan}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onDelete={handleDeletePlan}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StudyPlanner;
