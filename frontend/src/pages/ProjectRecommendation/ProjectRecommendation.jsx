import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { callAI, extractJSON } from '../../services/api';
import { projectService } from '../../services/projectService';
import {
  Code2, Clock, ChevronDown, ChevronUp, Sparkles, Target,
  Building2, Zap, TrendingUp, Star, BarChart3, Rocket,
  BookOpen, RefreshCw, Brain, Lightbulb, CheckCircle2,
  AlertCircle, GitBranch, Trophy, Flame, ArrowRight, Play,
  Search, MessageSquare
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAREER_PATHS = [
  'AI Engineer', 'ML Engineer', 'Full Stack Developer',
  'Backend Developer', 'Frontend Developer', 'Data Scientist',
  'Cloud Engineer', 'DevOps Engineer', 'Cyber Security', 'Mobile Developer'
];

const DREAM_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Zoho', 'Freshworks', 'TCS', 'Infosys', 'Wipro', 'Netflix', 'Tesla'
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Startup'];

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'FastAPI', 'SQL',
  'Docker', 'AWS', 'Machine Learning', 'Deep Learning', 'RAG', 'LLM',
  'System Design', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'CI/CD'
];

const DIFF_COLORS = {
  Beginner:     'var(--accent-blue)',
  Intermediate: 'var(--accent-cyan)',
  Advanced:     'var(--accent-purple)',
  Expert:       'var(--accent-pink)',
  Startup:      '#d97706',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const callAIJSON = async (userPrompt, systemPrompt) => {
  const text = await callAI(userPrompt, systemPrompt);
  const cleanJson = extractJSON(text);
  return JSON.parse(cleanJson);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Chip = ({ label, color = '#a78bfa', icon: Icon }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 99,
    fontSize: '0.7rem', fontWeight: 700,
    background: `${color}18`, color, border: `1px solid ${color}35`,
  }}>
    {Icon && <Icon size={10} />}{label}
  </span>
);

const ScoreBar = ({ label, value, color = '#a78bfa' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 800 }}>{value}%</span>
    </div>
    <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

// ─── Project Card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project, onAnalyze }) => {
  const [expanded, setExpanded] = useState(false);
  const dc = DIFF_COLORS[project.difficulty] || '#a78bfa';

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${dc}40`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip label={project.difficulty} color={dc} />
          {project.company && <Chip label={project.company} color='#4ade80' icon={Building2} />}
          {project.is_trending && <Chip label='Trending' color='#fb923c' icon={Flame} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Clock size={11} />{project.duration}
        </div>
      </div>

      {/* Title + description */}
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {project.title}
        </h3>
        <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {project.description}
        </p>
      </div>

      {/* Impact scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
        {[
          { label: 'Resume Impact', value: project.resume_impact, color: 'var(--accent-purple)' },
          { label: 'Portfolio Value', value: project.portfolio_value, color: 'var(--accent-blue)' },
          { label: 'Hiring Demand', value: project.hiring_demand, color: '#4ade80' },
          { label: 'Learning Value', value: project.learning_value, color: '#fb923c' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>{s.label.toUpperCase()}</span>
              <span style={{ fontSize: '0.68rem', color: s.color, fontWeight: 800 }}>{s.value}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--border-color)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 99, transition: 'width 0.7s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {project.tech_stack?.map(t => (
          <span key={t} style={{
            fontSize: '0.7rem', padding: '3px 9px', borderRadius: 5, fontWeight: 700,
            background: 'var(--bg-primary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}>{t}</span>
        ))}
      </div>

      {/* Skills taught */}
      {project.skills_you_gain?.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <CheckCircle2 size={11} />
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>You'll gain:</span>
          {project.skills_you_gain.map(s => <span key={s} style={{ color: '#4ade80' }}>{s}</span>).reduce((a, b) => [a, <span key='sep' style={{ color: 'var(--border-color)' }}>·</span>, b])}
        </div>
      )}

      {/* Expandable roadmap */}
      <button onClick={() => setExpanded(e => !e)}
        style={{
          borderTop: '1px solid var(--border-color)', paddingTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700, cursor: 'pointer',
          background: 'none', border: 'none',
          width: '100%',
        }}>
        <span>{expanded ? 'Hide Roadmap' : 'View AI Roadmap'}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>BUILD ROADMAP</span>
          {project.roadmap?.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 22, height: 22, borderRadius: '50%',
                background: `${dc}20`, border: `1px solid ${dc}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 800, color: dc, flexShrink: 0,
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{step.phase}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.tasks}</div>
              </div>
            </div>
          ))}

          {/* Analyze button */}
          <button onClick={() => onAnalyze(project)}
            style={{
              marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: 'var(--accent-purple)', cursor: 'pointer',
            }}>
            <Brain size={13} />Analyze Resume Impact
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectRecommendation = () => {
  const [career,       setCareer]       = useState('AI Engineer');
  const [company,      setCompany]      = useState('');
  const [difficulty,   setDifficulty]   = useState('Intermediate');
  const [skills,       setSkills]       = useState(['Python', 'React']);
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [simResult,    setSimResult]    = useState(null);
  const [simLoading,   setSimLoading]   = useState(false);
  const [analyzeProj,  setAnalyzeProj]  = useState(null);
  const [analyzeResult,setAnalyzeResult]= useState(null);
  const [activeTab,    setActiveTab]    = useState('discover'); // discover | simulator | mentor
  const [mentorQ,      setMentorQ]      = useState('');
  const [mentorReply,  setMentorReply]  = useState('');
  const [mentorLoading,setMentorLoading]= useState(false);
  const [analyzeLoading,setAnalyzeLoading] = useState(false);

  // Error states
  const [genError,     setGenError]     = useState('');
  const [simError,     setSimError]     = useState('');
  const [analyzeError, setAnalyzeError] = useState('');
  const [mentorError,  setMentorError]  = useState('');

  const toggleSkill = s => setSkills(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await projectService.getSavedProjects();
        if (data && data.length > 0) {
          setProjects(data);
        }
      } catch (e) {
        console.error("Failed to load saved projects:", e);
      }
    };
    fetchSaved();
  }, []);

  // ── Generate Projects ───────────────────────────────────────────────────────

  const generateProjects = async () => {
    setLoading(true);
    setProjects([]);
    setSimResult(null);
    setAnalyzeResult(null);
    setGenError('');
    try {
      const list = await callAIJSON(
        `Generate project recommendations now.`,
        `You are ANVIORA's AI Project Engine. Generate 4 project recommendations for:
        Career goal: ${career}
        Dream company: ${company || 'any'}
        Difficulty: ${difficulty}
        Current skills: ${skills.join(', ')}
        
        Rules:
        - Be brutally realistic. Do not suggest unrealistic project timelines (e.g., building a complete production-grade microservice architecture in 1 week). Give a realistic duration (e.g., 6-12 weeks for complex projects).
        - Resume impact and other scores must be realistic, not inflated. Most student projects score between 30-60%. Only highly advanced, unique projects should score higher.
        
        Respond ONLY with a JSON array. Each item:
        {
          "id": "<unique string>",
          "title": "<project name>",
          "description": "<2-sentence description>",
          "difficulty": "${difficulty}",
          "duration": "<realistic timeline, e.g., 6-8 weeks>",
          "company": "${company || ''}",
          "is_trending": <true|false>,
          "tech_stack": ["<tech1>", "<tech2>", "<tech3>", "<tech4>"],
          "skills_you_gain": ["<skill1>", "<skill2>", "<skill3>"],
          "resume_impact": <10-90 integer representing actual, non-inflated resume impact>,
          "portfolio_value": <10-90 integer, non-inflated>,
          "hiring_demand": <10-90 integer, non-inflated>,
          "learning_value": <10-90 integer, non-inflated>,
          "roadmap": [
            { "phase": "<phase name>", "tasks": "<realistic and specific task in 1 sentence>" },
            { "phase": "<phase name>", "tasks": "<realistic and specific task in 1 sentence>" },
            { "phase": "<phase name>", "tasks": "<realistic and specific task in 1 sentence>" },
            { "phase": "<phase name>", "tasks": "<realistic and specific task in 1 sentence>" },
            { "phase": "<phase name>", "tasks": "<realistic and specific task in 1 sentence>" }
          ]
        }
        No markdown, no preamble. Only the JSON array.`
      );
      const cleanList = Array.isArray(list) ? list : [];
      setProjects(cleanList);
      if (cleanList.length > 0) {
        try {
          await projectService.saveProject(cleanList);
        } catch (saveErr) {
          console.error("Failed to persist generated projects:", saveErr);
        }
      }
    } catch (e) {
      console.error(e);
      setGenError(e.message?.includes('unavailable') || e.message?.includes('TIMEOUT')
        ? e.message
        : 'AI is temporarily unavailable. Please try again in a moment.');
    }
    finally { setLoading(false); }
  };

  // ── Resume Impact Analyzer ──────────────────────────────────────────────────

  const analyzeImpact = async (project) => {
    setAnalyzeProj(project);
    setAnalyzeResult(null);
    setAnalyzeLoading(true);
    setAnalyzeError('');
    try {
      const result = await callAIJSON(
        `Analyze resume impact of project: "${project.title}" for a ${career} targeting ${company || 'top tech companies'}.`,
        `You are ANVIORA's Portfolio Intelligence AI. Evaluate the project resume impact strictly and critically. Do not inflate score improvements or placement boost metrics. If a project is basic, keep the score gains low and point out the weaknesses. Respond ONLY with JSON:
        {
          "before_score": <1-100 strict score before, be realistic>,
          "after_score": <1-100 strict score after, do not inflate>,
          "company_readiness_before": <1-100, realistic>,
          "company_readiness_after": <1-100, realistic>,
          "ats_keywords": ["<kw1>", "<kw2>", "<kw3>", "<kw4>"],
          "recruiter_verdict": "<one brutally honest recruiter verdict outlining actual flaws or values>",
          "missing_to_maximize": ["<critique and tip1>", "<critique and tip2>"],
          "placement_boost": "<realistic improvement, e.g. +5% placement probability>"
        }
        No markdown, no preamble.`
      );
      setAnalyzeResult(result);
    } catch (e) {
      console.error(e);
      setAnalyzeError(e.message?.includes('unavailable') || e.message?.includes('TIMEOUT')
        ? e.message
        : 'AI is temporarily unavailable. Please try again in a moment.');
    }
    finally { setAnalyzeLoading(false); }
  };

  // ── Project Simulator ───────────────────────────────────────────────────────

  const runSimulator = async () => {
    if (projects.length === 0) return;
    setSimLoading(true);
    setSimResult(null);
    setSimError('');
    try {
      const titles = projects.map(p => p.title).join(', ');
      const result = await callAIJSON(
        `Simulate portfolio growth if student completes: ${titles}. Career: ${career}. Company: ${company || 'top tech'}.`,
        `You are ANVIORA's AI Project Simulator. Evaluate the growth strictly. Give realistic scores based on the actual inputs. Do not pad scores or suggest unrealistic timelines. Respond ONLY with JSON:
        {
          "portfolio_before": <1-100 strict score, be brutal>,
          "portfolio_after": <1-100, realistic, non-inflated>,
          "company_readiness_before": <1-100, brutal>,
          "company_readiness_after": <1-100, realistic>,
          "new_skills_unlocked": ["<skill1>", "<skill2>", "<skill3>"],
          "placement_probability_before": <1-100, brutal>,
          "placement_probability_after": <1-100, realistic>,
          "github_score_boost": "<e.g. +5 points>",
          "timeline_weeks": <realistic number of weeks required to complete all listed projects (e.g. 12-24 weeks)>,
          "verdict": "<one brutally honest verdict pointing out bottlenecks and real gaps, no sugarcoating>"
        }
        No markdown, no preamble.`
      );
      setSimResult(result);
    } catch (e) {
      console.error(e);
      setSimError(e.message?.includes('unavailable') || e.message?.includes('TIMEOUT')
        ? e.message
        : 'AI is temporarily unavailable. Please try again in a moment.');
    }
    finally { setSimLoading(false); }
  };

  // ── AI Mentor ───────────────────────────────────────────────────────────────

  const askMentor = async () => {
    if (!mentorQ.trim()) return;
    setMentorLoading(true);
    setMentorReply('');
    setMentorError('');
    try {
      const reply = await callAI(
        mentorQ,
        `You are ANVIORA's AI Career Mentor — a strict, brutally honest expert in tech careers, portfolio development, and recruitment.
The student's profile: Career goal: ${career}, Dream company: ${company || 'top tech'}, Skills: ${skills.join(', ')}.
Provide direct, critical, and unvarnished career coaching. Point out gaps in their skills and highlight what they are realistically lacking to land a job at their dream company. Do not use generic encouragement. Max 120 words.`
      );
      setMentorReply(reply);
    } catch (e) {
      console.error(e);
      setMentorError(e.message?.includes('unavailable') || e.message?.includes('TIMEOUT')
        ? e.message
        : 'AI is temporarily unavailable. Please try again in a moment.');
    }
    finally { setMentorLoading(false); }
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const S = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: 'inherit',
    },
    card: {
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 16, padding: '20px 22px',
    },
    label: {
      fontSize: '0.7rem', fontWeight: 700,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 8, display: 'block',
    },
    btn: (active, color = 'var(--accent-purple)') => ({
      padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem',
      cursor: 'pointer',
      border: active ? `1px solid ${color}` : '1px solid var(--border-color)',
      background: active ? `rgba(167, 139, 250, 0.12)` : 'transparent',
      color: active ? color : 'var(--text-secondary)',
      transition: 'all 0.2s',
    }),
    primaryBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '10px 22px', borderRadius: 10, fontWeight: 700,
      fontSize: '0.875rem', cursor: 'pointer', border: 'none',
      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
      color: '#fff', transition: 'opacity 0.2s',
    },
    tab: (active) => ({
      padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem',
      cursor: 'pointer', border: 'none',
      background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
      color: active ? 'var(--accent-purple)' : 'var(--text-secondary)',
      borderBottom: active ? '2px solid var(--accent-purple)' : '2px solid transparent',
      transition: 'all 0.2s',
    }),
    input: {
      width: '100%', background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)', borderRadius: 10,
      padding: '11px 14px', color: 'var(--text-primary)', fontSize: '0.875rem',
      outline: 'none', boxSizing: 'border-box',
    },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 },
  };

  const TABS = [
    { id: 'discover',  label: 'Discover',  icon: Search },
    { id: 'simulator', label: 'Simulator', icon: Rocket },
    { id: 'mentor',    label: 'AI Mentor', icon: Brain },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: "rgba(167, 139, 250, 0.15)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
          <Code2 size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: -0.3 }}>AI Project OS</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>From "what to build" → portfolio that gets you hired</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.tab(activeTab === t.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <t.icon size={14} />
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB: DISCOVER ─────────────────────────────────────────────────── */}
      {activeTab === 'discover' && (
        <>
          {/* Config */}
          <div style={{ ...S.card }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 18 }}>

              {/* Career */}
              <div>
                <span style={S.label}>Career Goal</span>
                <select value={career} onChange={e => setCareer(e.target.value)}
                  style={{ ...S.input, cursor: 'pointer' }}>
                  {CAREER_PATHS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <span style={S.label}>Difficulty</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      style={S.btn(difficulty === d, DIFF_COLORS[d] || 'var(--accent-purple)')}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream Company */}
              <div>
                <span style={S.label}>Dream Company</span>
                <select value={company} onChange={e => setCompany(e.target.value)}
                  style={{ ...S.input, cursor: 'pointer' }}>
                  <option value="">Any company</option>
                  {DREAM_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

            </div>

            {/* Skills */}
            <div style={{ marginBottom: 18 }}>
              <span style={S.label}>Your Current Skills</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SKILL_OPTIONS.map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    style={S.btn(skills.includes(s), 'var(--accent-blue)')}>
                    {skills.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateProjects} disabled={loading}
              style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Generating...</>
                : <><Sparkles size={14} />Generate Projects</>}
            </button>
            {genError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.8rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, marginTop: 14 }}>
                <AlertCircle size={14} /> {genError}
              </div>
            )}
          </div>

          {/* Empty state */}
          {projects.length === 0 && !loading && (
            <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
              <Lightbulb size={38} style={{ color: 'var(--text-muted)', marginBottom: 14 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Set your career goal and hit <strong style={{ color: 'var(--accent-purple)' }}>Generate Projects</strong>
              </p>
            </div>
          )}

          {/* Project grid */}
          {projects.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  {projects.length} PROJECTS RECOMMENDED FOR {career.toUpperCase()}{company ? ` → ${company.toUpperCase()}` : ''}
                </span>
                <button onClick={() => { setActiveTab('simulator'); runSimulator(); }}
                  style={{ fontSize: '0.78rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)',
                    border: '1px solid rgba(74,222,128,0.2)', borderRadius: 7, padding: '5px 12px',
                    cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Rocket size={12} />Simulate All Projects
                </button>
              </div>

              <div style={S.grid2}>
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} onAnalyze={analyzeImpact} />
                ))}
              </div>

              {/* Resume Impact Analyzer result */}
              {(analyzeLoading || analyzeResult || analyzeError) && analyzeProj && (
                <div style={{ ...S.card, marginTop: 20, borderColor: 'rgba(167,139,250,0.25)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BarChart3 size={13} />RESUME IMPACT ANALYSIS — {analyzeProj.title.toUpperCase()}
                  </div>

                  {analyzeError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginBottom: 10 }}>
                      <AlertCircle size={14} /> {analyzeError}
                    </div>
                  )}

                  {analyzeLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Analysing impact on your resume…
                    </div>
                  )}

                  {analyzeResult && !analyzeLoading && (
                    <div style={S.grid2}>
                      <div>
                        <ScoreBar label="Resume Score Before" value={analyzeResult.before_score} color='#f87171' />
                        <ScoreBar label="Resume Score After"  value={analyzeResult.after_score}  color='#4ade80' />
                        <ScoreBar label="Company Readiness Before" value={analyzeResult.company_readiness_before} color='#fbbf24' />
                        <ScoreBar label="Company Readiness After"  value={analyzeResult.company_readiness_after}  color='var(--accent-blue)' />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ padding: '12px 14px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10 }}>
                          <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700, marginBottom: 4 }}>RECRUITER VERDICT</div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{analyzeResult.recruiter_verdict}</p>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 6 }}>ATS KEYWORDS UNLOCKED</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {analyzeResult.ats_keywords?.map(k => <Chip key={k} label={k} color='var(--accent-blue)' />)}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 800 }}>
                          {analyzeResult.placement_boost}
                        </div>
                        {analyzeResult.missing_to_maximize?.map((t, i) => (
                          <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)',
                            padding: '7px 12px', background: 'rgba(251,146,60,0.06)',
                            border: '1px solid rgba(251,146,60,0.15)', borderRadius: 7, lineHeight: 1.5 }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TAB: SIMULATOR ────────────────────────────────────────────────── */}
      {activeTab === 'simulator' && (
        <div>
          {projects.length === 0 && (
            <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
              <Rocket size={38} style={{ color: 'var(--text-muted)', marginBottom: 14 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                First generate projects in the <strong style={{ color: 'var(--accent-purple)' }}>Discover</strong> tab, then simulate here.
              </p>
            </div>
          )}

          {projects.length > 0 && (
            <>
              <div style={{ ...S.card, marginBottom: 18 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 12 }}>
                  SIMULATING IMPACT OF COMPLETING ALL {projects.length} PROJECTS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {projects.map(p => <Chip key={p.id} label={p.title} color={DIFF_COLORS[p.difficulty] || 'var(--accent-purple)'} />)}
                </div>
                <button onClick={runSimulator} disabled={simLoading}
                  style={{ ...S.primaryBtn, opacity: simLoading ? 0.6 : 1 }}>
                  {simLoading
                    ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Simulating...</>
                    : <><Play size={14} />Run Simulation</>}
                </button>
                {simError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginTop: 14 }}>
                    <AlertCircle size={14} /> {simError}
                  </div>
                )}
              </div>

              {simResult && !simLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Before / After */}
                  <div style={S.grid2}>
                    {[
                      { label: 'Portfolio Score',        before: simResult.portfolio_before,           after: simResult.portfolio_after,           color: 'var(--accent-purple)' },
                      { label: 'Company Readiness',      before: simResult.company_readiness_before,   after: simResult.company_readiness_after,   color: 'var(--accent-blue)' },
                      { label: 'Placement Probability',  before: simResult.placement_probability_before, after: simResult.placement_probability_after, color: '#4ade80' },
                    ].map(s => (
                      <div key={s.label} style={S.card}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 12 }}>{s.label.toUpperCase()}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>{s.before}%</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>NOW</div>
                          </div>
                          <ArrowRight size={20} style={{ color: 'var(--border-color)' }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.after}%</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AFTER</div>
                          </div>
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>
                              +{s.after - s.before}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extra details */}
                  <div style={S.grid2}>
                    <div style={{ ...S.card, borderColor: 'rgba(74,222,128,0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: 10 }}>SKILLS YOU'LL UNLOCK</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {simResult.new_skills_unlocked?.map(s => <Chip key={s} label={s} color='#4ade80' />)}
                      </div>
                    </div>
                    <div style={{ ...S.card, borderColor: 'rgba(167,139,250,0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 8 }}>VERDICT</div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {simResult.verdict}
                      </p>
                      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Chip label={`GitHub ${simResult.github_score_boost}`} color='var(--accent-blue)' icon={GitBranch} />
                        <Chip label={`${simResult.timeline_weeks} weeks`} color='#fb923c' icon={Clock} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: AI MENTOR ────────────────────────────────────────────────── */}
      {activeTab === 'mentor' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={12} />ASK YOUR AI CAREER MENTOR
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[
                'Which project should I build next?',
                `What's missing for ${company || 'Google'}?`,
                'How do I improve my portfolio score?',
                'Best tech stack for my career goal?',
              ].map(q => (
                <button key={q} onClick={() => setMentorQ(q)}
                  style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 600,
                    background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--accent-purple)' }}>
                  {q}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Ask anything about your project journey, career, or what to build next..."
              value={mentorQ}
              onChange={e => setMentorQ(e.target.value)}
              rows={3}
              style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }}
            />
            <button onClick={askMentor} disabled={mentorLoading || !mentorQ.trim()}
              style={{ ...S.primaryBtn, marginTop: 10, opacity: (mentorLoading || !mentorQ.trim()) ? 0.5 : 1 }}>
              {mentorLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Thinking...</> : <><Brain size={14} />Ask Mentor</>}
            </button>
            {mentorError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginTop: 14 }}>
                <AlertCircle size={14} /> {mentorError}
              </div>
            )}
          </div>

          {/* Reply */}
          {mentorReply && !mentorLoading && (
            <div style={{ ...S.card, borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 10 }}>MENTOR SAYS</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {mentorReply}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { background: var(--bg-secondary); color: var(--text-primary); }
        textarea:focus, input:focus, select:focus { border-color: var(--accent-purple) !important; }
      `}</style>
    </div>
  );
};

export default ProjectRecommendation;