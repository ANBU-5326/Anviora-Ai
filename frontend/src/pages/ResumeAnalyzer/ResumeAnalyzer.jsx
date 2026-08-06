import React, { useState, useEffect, useRef } from 'react';
import { callAI, extractJSON } from '../../services/api';
import api from '../../services/api';
import {
  Upload, FileText, CheckCircle2, AlertCircle, RefreshCw,
  Target, Zap, Brain, Briefcase, Star, TrendingUp, Code2,
  ArrowRight, X, ChevronDown, ChevronUp, Eye, Wand2,
  Search, BarChart2, Shield, Award, Rocket, GitBranch
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, CartesianGrid
} from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const scoreColor = (s) => s >= 80 ? '#34d399' : s >= 60 ? '#fbbf24' : '#f87171';
const scoreLabel = (s) => s >= 80 ? 'Strong' : s >= 60 ? 'Moderate' : 'Needs Work';
const statusColor = { strong: '#34d399', medium: '#fbbf24', weak: '#f87171' };

// ─── COMPANY FIT CALCULATOR (real keyword-based, not fake math) ──────────────
const COMPANY_SKILLS = {
  Google:    ['algorithms', 'system design', 'python', 'java', 'c++', 'leadership', 'kubernetes', 'distributed systems', 'data structures', 'problem solving'],
  Microsoft: ['azure', 'system design', 'c#', 'python', 'java', '.net', 'cloud', 'algorithms', 'sql', 'typescript'],
  Amazon:    ['aws', 'leadership', 'scalability', 'python', 'java', 'distributed systems', 'sql', 'microservices', 'devops', 'problem solving'],
  TCS:       ['java', 'python', 'sql', 'testing', 'agile', 'communication', 'aptitude', 'html', 'css', 'javascript'],
  Infosys:   ['java', 'python', 'sql', 'agile', 'testing', 'communication', 'javascript', 'html', 'problem solving', 'git'],
  Wipro:     ['java', 'python', 'sql', 'communication', 'testing', 'problem solving', 'javascript', 'agile', 'git', 'html'],
};

const buildCompanies = (presentKeywords) => {
  const present = (presentKeywords || []).map(k => k.toLowerCase());
  return [
    { name: 'Google',    color: '#4285F4', logo: '🔵', required: 90 },
    { name: 'Microsoft', color: '#00A4EF', logo: '🪟', required: 80 },
    { name: 'Amazon',    color: '#FF9900', logo: '🟠', required: 85 },
    { name: 'TCS',       color: '#0066CC', logo: '🏢', required: 60 },
    { name: 'Infosys',   color: '#007CC3', logo: '🔷', required: 55 },
    { name: 'Wipro',     color: '#9B2335', logo: '🔴', required: 55 },
  ].map(c => {
    const needed = COMPANY_SKILLS[c.name];
    const matched = needed.filter(skill =>
      present.some(p => p.includes(skill) || skill.includes(p))
    );
    const missing = needed
      .filter(skill => !present.some(p => p.includes(skill) || skill.includes(p)))
      .map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const current = Math.round((matched.length / needed.length) * 100);
    return { ...c, current, missing };
  });
};

const Ring = ({ value, size = 64, stroke = 6, color, label }) => {
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const col = color || scoreColor(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color,#2a2a4a)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={col} strokeWidth={stroke}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
            style={{ fill: col, fontSize: size * 0.22, fontWeight: 700, fontFamily: 'inherit' }}>
            {value}%
          </text>
        </svg>
      </div>
      {label && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary,#8888aa)', textAlign: 'center', maxWidth: 80, display: 'block', lineHeight: 1.2 }}>{label}</span>}
    </div>
  );
};

const ScoreBar = ({ score, color }) => (
  <div style={{ height: 5, background: 'var(--border-color,#2a2a4a)', borderRadius: 3 }}>
    <div style={{ height: '100%', width: `${score}%`, background: color || scoreColor(score), borderRadius: 3, transition: 'width 0.6s ease' }} />
  </div>
);

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
    background: active ? 'var(--accent-purple,#a78bfa)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary,#8888aa)', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }}>
    {Icon && <Icon size={14} />}{label}
  </button>
);

const Panel = ({ children, style }) => (
  <div style={{ background: 'var(--bg-secondary,#1a1a2e)', border: '1px solid var(--border-color,#2a2a4a)', borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)', margin: 0 }}>{children}</h3>
    {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#8888aa)', margin: '4px 0 0' }}>{sub}</p>}
  </div>
);

// ─── UPLOAD SCREEN ────────────────────────────────────────────────────────────

const UploadScreen = ({ onAnalyze }) => {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => { if (file) onAnalyze(file); };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        style={{
          padding: '56px 20px', textAlign: 'center', borderRadius: 14, cursor: 'pointer',
          border: `2px dashed ${drag ? 'var(--accent-purple,#a78bfa)' : 'var(--border-color,#2a2a4a)'}`,
          background: drag ? 'rgba(167,139,250,0.06)' : 'var(--bg-secondary,#1a1a2e)',
          transition: 'all 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={28} style={{ color: 'var(--accent-purple,#a78bfa)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)', margin: '0 0 6px' }}>Drop your resume here</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#8888aa)', margin: 0 }}>PDF, DOCX, or TXT — or click to browse</p>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { icon: Shield,    label: 'ATS Compatibility', desc: 'Parsed against 6 ATS systems' },
          { icon: Target,    label: 'JD Match',           desc: 'Compare vs job description'   },
          { icon: Wand2,     label: 'AI Bullet Rewrite',  desc: 'Improve weak bullet points'   },
          { icon: Briefcase, label: 'Company Readiness',  desc: 'Google, Amazon, TCS & more'   },
          { icon: Eye,       label: 'Recruiter View',     desc: 'Simulate recruiter feedback'   },
          { icon: BarChart2, label: 'Placement Score',    desc: 'Full placement readiness'      },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-secondary,#1a1a2e)', border: '1px solid var(--border-color,#2a2a4a)' }}>
            <Icon size={18} style={{ color: 'var(--accent-purple,#a78bfa)', marginBottom: 8 }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary,#e0e0ff)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted,#5555aa)' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── SHIMMER SKELETON LOADER ──────────────────────────────────────────────────

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
    <div className="skeleton-box" style={{ height: 100, borderRadius: 12 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      <div className="skeleton-box" style={{ height: 320, borderRadius: 12 }} />
      <div className="skeleton-box" style={{ height: 320, borderRadius: 12 }} />
    </div>
    <style>{`
      .skeleton-box {
        background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
        border: 1px solid var(--border-color,#2a2a4a);
      }
      @keyframes loading-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

// ─── ANALYZING SCREEN ─────────────────────────────────────────────────────────

const AnalyzingScreen = () => {
  const steps = [
    'Parsing resume structure...',
    'Checking ATS compatibility...',
    'Analyzing keywords...',
    'Scoring bullet points...',
    'Running recruiter simulation...',
    'Computing placement readiness...'
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Panel style={{ padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <LoadingSpinner size="md" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)', marginBottom: 4 }}>Analyzing your resume...</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary,#8888aa)', margin: 0 }}>{steps[step]}</p>
        </div>
      </Panel>
      <SkeletonLoader />
    </div>
  );
};

// ─── ERROR SCREEN ─────────────────────────────────────────────────────────────

const ErrorScreen = ({ error, onRetry }) => {
  const isNotResume = error?.includes('NOT_A_RESUME:') || error?.toLowerCase().includes('not a resume');
  const cleanMessage = isNotResume 
    ? error.replace(/^NOT_A_RESUME:\s*/, '')
    : error;

  return (
    <Panel style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: isNotResume ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
        border: `1px solid ${isNotResume ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isNotResume ? (
          <FileText size={34} style={{ color: '#fbbf24' }} />
        ) : (
          <AlertCircle size={34} style={{ color: '#f87171' }} />
        )}
      </div>

      <div style={{ maxWidth: 520 }}>
        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 20,
          background: isNotResume ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
          color: isNotResume ? '#fbbf24' : '#f87171',
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10
        }}>
          {isNotResume ? 'Invalid Document Type' : 'Analysis Failed'}
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary,#e0e0ff)', margin: '0 0 10px' }}>
          {isNotResume ? 'This File Is Not a Resume' : 'Could Not Analyze Resume'}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary,#8888aa)', margin: 0, lineHeight: 1.6 }}>
          {cleanMessage || 'An unexpected error occurred during resume analysis.'}
        </p>
      </div>

      {isNotResume && (
        <div style={{
          background: 'var(--bg-tertiary,#12122a)', border: '1px solid var(--border-color,#2a2a4a)',
          borderRadius: 10, padding: '14px 18px', textAlign: 'left', maxWidth: 480, width: '100%'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>
            💡 What makes a valid resume document?
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: 'var(--text-secondary,#8888aa)', lineHeight: 1.6 }}>
            <li>Personal contact details (Name, Email, Phone, LinkedIn/GitHub)</li>
            <li>Educational qualifications (Degree, University, Graduation year)</li>
            <li>Technical/Professional skills & competencies</li>
            <li>Work experience, internships, or project contributions</li>
          </ul>
        </div>
      )}

      <button onClick={onRetry} style={{
        padding: '11px 26px', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
        color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(167,139,250,0.3)'
      }}>
        <Upload size={16} /> {isNotResume ? 'Upload a Valid Resume' : 'Try Another Resume'}
      </button>
    </Panel>
  );
};

// ─── TAB: SCORES ─────────────────────────────────────────────────────────────

const ScoresTab = ({ r }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted,#5555aa)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Overall Resume Score</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreColor(r.scores.overall), lineHeight: 1 }}>{r.scores.overall}<span style={{ fontSize: '1rem', color: 'var(--text-muted,#5555aa)' }}>/100</span></div>
          <div style={{ fontSize: '0.82rem', color: scoreColor(r.scores.overall), marginTop: 4 }}>
            {scoreLabel(r.scores.overall)} — {
              r.scores.overall >= 80
                ? 'Exceptional resume alignment with industry standards!'
                : `Needs improvement in ${r.sections?.filter(s => s.status !== 'strong').map(s => s.name).slice(0, 2).join(' & ') || 'key areas'}.`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'ATS Score',    val: r.scores.ats        },
            { label: 'Recruiter',    val: r.scores.recruiter  },
            { label: 'Keywords',     val: r.scores.keywords   },
            { label: 'Formatting',   val: r.scores.formatting },
            { label: 'Impact',       val: r.scores.impact     },
            { label: 'Completeness', val: r.scores.completeness },
          ].map(m => <Ring key={m.label} value={m.val} size={68} label={m.label} />)}
        </div>
      </div>
    </Panel>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      <Panel>
        <SectionTitle sub="Spider chart across 6 dimensions">Resume Radar</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={r.radarData}>
            <PolarGrid stroke="var(--border-color,#2a2a4a)" />
            <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary,#8888aa)" fontSize={11} />
            <PolarRadiusAxis domain={[0, 100]} stroke="var(--text-muted,#5555aa)" fontSize={9} />
            <Radar dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} name="Your Score" />
            <Radar dataKey="full" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.05} name="Target" />
            <Tooltip contentStyle={{ background: 'var(--bg-tertiary,#12122a)', border: '1px solid var(--border-color,#2a2a4a)', borderRadius: 8 }} />
          </RadarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel>
        <SectionTitle sub="Click any section to see feedback">Section Breakdown</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {r.sections.map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-primary,#e0e0ff)', fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: statusColor[s.status], fontWeight: 600 }}>{s.score}%</span>
              </div>
              <ScoreBar score={s.score} color={statusColor[s.status]} />
              {s.status !== 'strong' && <p style={{ fontSize: '0.71rem', color: 'var(--text-muted,#5555aa)', margin: '4px 0 0' }}>{s.feedback}</p>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);

// ─── TAB: KEYWORDS ────────────────────────────────────────────────────────────

const KeywordsTab = ({ r }) => {
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [jdError, setJdError] = useState('');

  const runJD = async () => {
    if (!jdText.trim()) return;
    setJdLoading(true);
    setJdError('');
    setJdResult(null);
    try {
      const systemPrompt = `You are ANVIORA's AI Resume-JD Matcher. Respond strictly and honestly. Do not pad match rates. Analyze how well a resume matches a job description and respond with a structured analysis. Include: overall match percentage, matched keywords, missing keywords, and 3-4 specific improvement suggestions. Be concise and actionable.`;
      const message = `Job Description:\n${jdText}\n\nMy resume keywords: ${r.keywords.present.join(', ')}. Missing from my resume: ${r.keywords.missing.join(', ')}. Analyze the JD match and give improvement suggestions.`;
      const reply = await callAI(message, systemPrompt);
      setJdResult({ aiResponse: reply });
    } catch (e) {
      setJdError('Failed to reach AI server. Make sure the backend service is online.');
    }
    setJdLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <Panel>
          <SectionTitle sub="Keywords found in your resume">✅ Present Keywords</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {r.keywords.present.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No keywords detected.</span>
            ) : r.keywords.present.map(k => (
              <span key={k} style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontWeight: 500 }}>{k}</span>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionTitle sub="High-demand keywords you're missing">❌ Missing Keywords</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {r.keywords.missing.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No missing keywords detected.</span>
            ) : r.keywords.missing.map(k => (
              <span key={k} style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontWeight: 500 }}>{k}</span>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle sub="Passive phrases that hurt your ATS score — replace with strong action verbs">⚠️ Overused / Weak Phrases</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {r.keywords.overused.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No overused phrases detected. Excellent!</span>
          ) : r.keywords.overused.map(p => (
            <div key={p} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={13} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>"{p}"</span>
              <ArrowRight size={12} style={{ color: 'var(--text-muted,#5555aa)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary,#8888aa)' }}>use stronger action verb</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle sub="Paste a job description to get AI-powered match analysis">🎯 Job Description Matcher (AI-Powered)</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            placeholder="Paste the full job description here..."
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-color,#2a2a4a)', background: 'var(--bg-tertiary,#12122a)', color: 'var(--text-primary,#e0e0ff)', fontSize: '0.83rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          <button onClick={runJD} disabled={jdLoading || !jdText.trim()} style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 8, border: 'none', background: jdLoading ? 'rgba(167,139,250,0.4)' : 'var(--accent-purple,#a78bfa)', color: '#fff', fontWeight: 600, cursor: (jdLoading || !jdText.trim()) ? 'not-allowed' : 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} style={{ animation: jdLoading ? 'spin 1s linear infinite' : 'none' }} />
            {jdLoading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          {jdError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
              <AlertCircle size={14} /> {jdError}
            </div>
          )}
          {jdResult?.aiResponse && (
            <div style={{ padding: 16, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={13} /> AI JD Match Analysis
              </div>
              <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary,#8888aa)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{jdResult.aiResponse}</p>
              <button onClick={() => setJdResult(null)} style={{ marginTop: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color,#2a2a4a)', background: 'transparent', color: 'var(--text-muted,#5555aa)', fontSize: '0.72rem', cursor: 'pointer' }}>Clear</button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};

// ─── TAB: AI IMPROVE ──────────────────────────────────────────────────────────

const AIImproveTab = ({ r }) => {
  const [copied, setCopied] = useState(null);
  const [aiPlan, setAiPlan] = useState('');
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanError, setAiPlanError] = useState('');

  const copy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const fetchAIPlan = async () => {
    setAiPlanLoading(true);
    setAiPlanError('');
    setAiPlan('');
    try {
      const weakSections = r.sections.filter(s => s.status !== 'strong').map(s => `${s.name} (${s.score}%): ${s.feedback}`).join('\n');
      const systemPrompt = `You are ANVIORA's strict, brutally honest AI Resume Coach. Give a concrete, direct, prioritized action plan. Do not sugarcoat or give false encouragement. Target real flaws. Max 150 words.`;
      const message = `My resume overall score is ${r.scores.overall}/100.\nWeak sections:\n${weakSections}\nMissing keywords: ${r.keywords.missing.join(', ')}.\nGive me a strict priority action plan to improve my resume score.`;
      const reply = await callAI(message, systemPrompt);
      setAiPlan(reply);
    } catch (e) {
      setAiPlanError('Failed to reach AI server. Make sure the backend service is online.');
    }
    setAiPlanLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Panel>
        <SectionTitle sub="AI-rewritten versions of your weak bullet points">✍️ AI Bullet Point Rewriter</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {r.bullets.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No weak bullet points identified for rewriting.</div>
          ) : r.bullets.map((b, i) => (
            <div key={i} style={{ borderRadius: 10, border: '1px solid var(--border-color,#2a2a4a)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.05)', borderBottom: '1px solid var(--border-color,#2a2a4a)' }}>
                <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600, marginBottom: 4 }}>BEFORE — WEAK</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#8888aa)', fontStyle: 'italic' }}>"{b.original}"</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(52,211,153,0.04)' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, marginBottom: 4 }}>AFTER — AI IMPROVED</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary,#e0e0ff)', lineHeight: 1.5 }}>{b.improved}</div>
                <button onClick={() => copy(b.improved, i)}
                  style={{ marginTop: 10, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
                  {copied === i ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle sub="Sections that need immediate attention">🔧 Section Quick Fixes</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {r.sections.filter(s => s.status !== 'strong').length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>All sections meet strong standards. Excellent work!</div>
          ) : r.sections.filter(s => s.status !== 'strong').map(s => (
            <div key={s.name} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-tertiary,#12122a)', border: `1px solid ${statusColor[s.status]}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary,#e0e0ff)' }}>{s.name}</span>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: `${statusColor[s.status]}15`, color: statusColor[s.status], fontWeight: 600 }}>{s.score}% — {scoreLabel(s.score)}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#8888aa)', margin: 0, lineHeight: 1.5 }}>{s.feedback}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ padding: 20, borderRadius: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Zap size={16} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a78bfa' }}>AI Priority Action Plan</div>
          </div>
          <button onClick={fetchAIPlan} disabled={aiPlanLoading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600, cursor: aiPlanLoading ? 'not-allowed' : 'pointer', opacity: aiPlanLoading ? 0.7 : 1 }}>
            <RefreshCw size={12} style={{ animation: aiPlanLoading ? 'spin 1s linear infinite' : 'none' }} />
            {aiPlanLoading ? 'Analyzing...' : aiPlan ? 'Re-analyze' : 'Get AI Plan'}
          </button>
        </div>
        {aiPlanError && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.8rem', marginBottom: 10 }}><AlertCircle size={14} /> {aiPlanError}</div>}
        {aiPlanLoading && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary,#8888aa)', fontSize: '0.83rem' }}><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite', color: '#a78bfa' }} />ANVIORA is building your action plan...</div>}
        {aiPlan && !aiPlanLoading && <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary,#8888aa)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiPlan}</div>}
        {!aiPlan && !aiPlanLoading && !aiPlanError && <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted,#5555aa)', fontStyle: 'italic' }}>Click <strong style={{ color: '#a78bfa' }}>Get AI Plan</strong> to receive a personalized, prioritized action plan from ANVIORA.</p>}
      </div>
    </div>
  );
};

// ─── TAB: COMPANY READINESS ───────────────────────────────────────────────────

const CompanyTab = ({ r }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {r.companies.map(c => {
          const pct = Math.min(100, Math.round((c.current / c.required) * 100));
          const ready = c.current >= c.required;
          return (
            <div key={c.name} onClick={() => setSelected(selected?.name === c.name ? null : c)}
              style={{ cursor: 'pointer', padding: '18px 16px', borderRadius: 12, border: `1px solid ${selected?.name === c.name ? c.color : 'var(--border-color,#2a2a4a)'}`, background: selected?.name === c.name ? `${c.color}11` : 'var(--bg-secondary,#1a1a2e)', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{c.logo}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)', marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted,#5555aa)', marginBottom: 10 }}>Needs {c.required}%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 5, background: 'var(--border-color,#2a2a4a)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.color }}>{c.current}%</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: ready ? '#34d399' : '#f87171' }}>
                {ready ? '✅ Resume ready' : `🔴 Gap: ${c.required - c.current}pts`}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <Panel style={{ border: `1px solid ${selected.color}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)' }}>{selected.logo} {selected.name} — Resume Readiness</div>
            <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary,#8888aa)' }}><X size={16} /></button>
          </div>
          {selected.missing.length === 0 ? (
            <div style={{ color: '#34d399', fontSize: '0.88rem' }}>✅ Your resume meets all requirements for {selected.name}. Apply now!</div>
          ) : (
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary,#8888aa)', marginBottom: 12 }}>Add these to your resume to pass {selected.name}'s ATS:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selected.missing.map(m => (
                  <span key={m} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.82rem', color: '#f87171' }}>+ {m}</span>
                ))}
              </div>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
};

// ─── TAB: RECRUITER SIM ───────────────────────────────────────────────────────

const RecruiterTab = ({ r }) => {
  const { recruiterSim: sim, placementScore: ps } = r;
  const placementAvg = Math.round(Object.values(ps).reduce((a, b) => a + b, 0) / Object.keys(ps).length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Panel style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Ring value={sim.interviewChance} size={90} color={scoreColor(sim.interviewChance)} />
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted,#5555aa)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Interview Probability</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary,#e0e0ff)', marginBottom: 4 }}>
            {sim.interviewChance >= 70 ? 'High chance' : sim.interviewChance >= 50 ? 'Moderate chance' : 'Low chance — needs work'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary,#8888aa)' }}>Strictly computed based on resume depth, tech stack fit, and market benchmarks.</div>
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <Panel>
          <SectionTitle>👍 Recruiter Likes</SectionTitle>
          {sim.pros.length === 0 ? <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>No significant pros identified.</div>
            : sim.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, fontSize: '0.83rem', color: 'var(--text-secondary,#8888aa)' }}>
                <CheckCircle2 size={14} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />{p}
              </div>
            ))}
        </Panel>
        <Panel>
          <SectionTitle>👎 Recruiter Concerns</SectionTitle>
          {sim.cons.length === 0 ? <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>No recruiter concerns identified.</div>
            : sim.cons.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, fontSize: '0.83rem', color: 'var(--text-secondary,#8888aa)' }}>
                <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />{c}
              </div>
            ))}
        </Panel>
      </div>

      <Panel>
        <SectionTitle>🚩 Red Flags Detected</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sim.redFlags.length === 0
            ? <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>No red flags found in your resume. Excellent.</span>
            : sim.redFlags.map(f => <span key={f} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.8rem', color: '#f87171' }}>⚠ {f}</span>)}
        </div>
      </Panel>

      <Panel>
        <SectionTitle sub="Questions likely asked based on your resume">🎤 Expected Interview Questions</SectionTitle>
        {sim.questions.length === 0 ? <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No questions generated.</div>
          : sim.questions.map((q, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary,#12122a)', border: '1px solid var(--border-color,#2a2a4a)', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary,#8888aa)', display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--accent-purple,#a78bfa)', fontWeight: 700, flexShrink: 0 }}>Q{i + 1}.</span>{q}
            </div>
          ))}
      </Panel>

      <Panel>
        <SectionTitle sub="Full placement readiness across all dimensions">📊 Placement Readiness Score: {placementAvg}%</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(ps).map(([key, val]) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-primary,#e0e0ff)', fontWeight: 500, textTransform: 'capitalize' }}>{key}</span>
                <span style={{ color: scoreColor(val), fontWeight: 600 }}>{val}%</span>
              </div>
              <ScoreBar score={val} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'scores',    label: 'Scores',         icon: BarChart2 },
  { key: 'keywords',  label: 'Keywords & JD',  icon: Search    },
  { key: 'improve',   label: 'AI Improve',     icon: Wand2     },
  { key: 'company',   label: 'Company Fit',    icon: Briefcase },
  { key: 'recruiter', label: 'Recruiter View', icon: Eye       },
];

// ─── FILE TEXT EXTRACTOR ─────────────────────────────────────────────────────

const extractTextFromFile = async (file) => {
  const ext = file.name.toLowerCase().split('.').pop();

  if (ext === 'pdf' || ext === 'docx') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await api.post('/resume/extract-text', formData);
      const text = resp.data?.text;
      if (text && text.trim().length > 50) return text;
    } catch (backendErr) {
      console.warn('Backend extraction failed, trying client-side:', backendErr.message);
    }
  }

  return new Promise((resolve, reject) => {
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target.result);
        let raw = '';
        for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);

        if (ext === 'pdf') {
          const chunks = [];
          const btEt = /BT[\s\S]*?ET/g;
          let m;
          while ((m = btEt.exec(raw)) !== null) {
            const block = m[0];
            const tjRx = /\(([^)]{1,600})\)\s*(?:Tj|'|")/g;
            let t;
            while ((t = tjRx.exec(block)) !== null) {
              const s = t[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/[^\x20-\x7E\n\r\t]/g, '');
              if (s.trim().length > 1) chunks.push(s);
            }
            const tjArr = /\[([^\]]*)\]\s*TJ/g;
            while ((t = tjArr.exec(block)) !== null) {
              const inner = t[1];
              const parts = /\(([^)]{1,300})\)/g;
              let p; let combined = '';
              while ((p = parts.exec(inner)) !== null) combined += p[1].replace(/[^\x20-\x7E]/g, '');
              if (combined.trim().length > 1) chunks.push(combined);
            }
          }
          if (chunks.length > 0) { resolve(chunks.join('\n')); return; }
          const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{4,}/g, '\n').trim();
          if (readable.length > 80) { resolve(readable); return; }
          reject(new Error('Could not extract text from this PDF. It may be a scanned image. Please use a text-based PDF or save as TXT.'));

        } else if (ext === 'docx') {
          const xmlTags = /<w:t(?:[^>]*)>([^<]{1,500})<\/w:t>/g;
          const pieces = [];
          let m2;
          while ((m2 = xmlTags.exec(raw)) !== null) {
            const s = m2[1].trim();
            if (s.length > 0) pieces.push(s);
          }
          if (pieces.length > 0) { resolve(pieces.join(' ')); return; }
          const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{4,}/g, '\n').trim();
          if (readable.length > 80) { resolve(readable); return; }
          reject(new Error('Could not extract text from this DOCX. Please save as TXT and try again.'));

        } else {
          reject(new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.'));
        }
      } catch (err) {
        reject(new Error('File parsing failed: ' + err.message));
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

// ─── RESUME ANALYZER ─────────────────────────────────────────────────────────

const ResumeAnalyzer = () => {
  const [state, setState] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [tab, setTab] = useState('scores');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisId, setAnalysisId] = useState(0);

  // ── Load latest resume from DB on page open ─────────────────────────────
  useEffect(() => {
    const loadLatestResume = async () => {
      try {
        const resp = await api.get('/resume/latest');
        if (resp.data) {
          const r = resp.data;
          const presentKeywords = r.keyword_match.filter(k => k.present).map(k => k.word);
          setFileName(r.filename);
          setAnalysisResult({
            scores: {
              overall:      r.score,
              ats:          r.metrics.ats_score,
              recruiter:    r.metrics.impact_score,
              keywords:     r.metrics.ats_score,
              formatting:   r.metrics.brevity_score,
              grammar:      r.metrics.grammar_score,
              impact:       r.metrics.impact_score,
              completeness: r.metrics.brevity_score,
            },
            radarData: [
              { subject: 'ATS',        score: r.metrics.ats_score,     full: 100 },
              { subject: 'Keywords',   score: r.metrics.ats_score,     full: 100 },
              { subject: 'Impact',     score: r.metrics.impact_score,  full: 100 },
              { subject: 'Formatting', score: r.metrics.brevity_score, full: 100 },
              { subject: 'Grammar',    score: r.metrics.grammar_score, full: 100 },
            ],
            keywords: {
              present:  presentKeywords,
              missing:  r.keyword_match.filter(k => !k.present).map(k => k.word),
              overused: [],
            },
            sections: r.analysis.improvements.map(i => ({
              name:     i.section,
              score:    50,
              status:   'weak',
              feedback: i.recommendation,
            })),
            bullets:      [],
            companies:    buildCompanies(presentKeywords),
            recruiterSim: { pros: r.analysis.positives, cons: [], redFlags: [], questions: [], interviewChance: r.score },
            placementScore: { resume: r.score, coding: 50, communication: 50, projects: 50, certifications: 50, internships: 50, aptitude: 50 },
          });
          setState('results');
        }
      } catch (e) {
        // No previous resume — stay on upload screen
      }
    };
    loadLatestResume();
  }, []);

  // ── Run full analysis ────────────────────────────────────────────────────
  const runAnalysis = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setAnalyzing(true);
    setState('loading');
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const fileText = await extractTextFromFile(file);
      if (!fileText || fileText.trim().length < 40) {
        throw new Error('NOT_A_RESUME: The uploaded document contains no readable text or is empty. Please upload a valid text-based resume (PDF, DOCX, or TXT).');
      }

      const systemPrompt = `You are an expert, strict, and honest resume evaluator and ATS specialist.

CRITICAL FIRST STEP - RESUME VERIFICATION:
Determine if the provided text is genuinely a candidate's Resume or Curriculum Vitae (CV).
A resume/CV is a document that presents an individual's personal background, work experience, technical/professional skills, education, projects, certifications, or contact details.

If the document is NOT a resume (for example: an academic assignment, homework, exam paper, research paper, sales invoice, receipt, source code file, book chapter, financial statement, recipe, user manual, terms of service, random text, generic article, etc.):
You MUST return ONLY valid JSON with this exact structure and NOTHING else:
{
  "is_resume": false,
  "reason": "This document appears to be a [specify document type, e.g. research paper / Python source file / math homework assignment / sales invoice] rather than a candidate resume. It lacks standard resume sections such as work experience, education, skills, or contact information."
}

If the document IS a valid resume/CV:
Analyze it strictly and honestly like a senior technical recruiter at a top engineering firm.
Do NOT inflate scores. Do NOT give false praise.
Evaluate based strictly on actual content, depth, quantitative impact, ATS readability, and tech stack relevance. Most student/junior candidate resumes score between 40 and 65. Only exceptional resumes score above 80.
Return ONLY valid JSON matching exactly this structure:
{
  "is_resume": true,
  "scores": { "overall": 55, "ats": 60, "recruiter": 45, "keywords": 50, "formatting": 70, "grammar": 80, "impact": 40, "completeness": 50 },
  "radarData": [
    { "subject": "ATS", "score": 60, "full": 100 },
    { "subject": "Keywords", "score": 50, "full": 100 },
    { "subject": "Impact", "score": 40, "full": 100 },
    { "subject": "Formatting", "score": 70, "full": 100 },
    { "subject": "Grammar", "score": 80, "full": 100 }
  ],
  "keywords": {
    "present": ["Python", "Git"],
    "missing": ["Docker", "Kubernetes", "AWS"],
    "overused": ["responsible for"]
  },
  "sections": [
    { "name": "Contact Info", "score": 90, "status": "strong", "feedback": "All vital contacts present." },
    { "name": "Projects", "score": 40, "status": "weak", "feedback": "No deployment links, very generic details." }
  ],
  "bullets": [
    { "original": "Worked on web app development.", "improved": "Architected frontend using React, decreasing page load latency by 20%." }
  ],
  "recruiterSim": {
    "pros": ["Clear visual structure"],
    "cons": ["Lacks quantified business impact"],
    "redFlags": ["Passive action phrasing"],
    "questions": ["Can you explain the scale and architecture of your project?"],
    "interviewChance": 35
  },
  "placementScore": {
    "resume": 55, "coding": 40, "communication": 60, "projects": 35, "certifications": 30, "internships": 10, "aptitude": 50
  }
}`;

      const responseText = await callAI(fileText, systemPrompt);
      
      let parsed;
      try {
        const clean = extractJSON(responseText);
        parsed = JSON.parse(clean);
      } catch (jsonErr) {
        try {
          const sanitized = (extractJSON(responseText) || "")
            .replace(/,\s*([\}\]])/g, '$1')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
          parsed = JSON.parse(sanitized);
        } catch (e2) {
          throw new Error('Could not parse AI evaluation response. Please try uploading the file again.');
        }
      }

      // Check if AI identified document as NOT a resume
      if (parsed.is_resume === false || parsed.isResume === false) {
        const reason = parsed.reason || 'This document is not a candidate resume. Please upload a valid resume file (PDF, DOCX, or TXT).';
        throw new Error(`NOT_A_RESUME: ${reason}`);
      }

      const normalizedScores = {
        overall:      parsed.scores?.overall      ?? 55,
        ats:          parsed.scores?.ats          ?? 55,
        recruiter:    parsed.scores?.recruiter    ?? 50,
        keywords:     parsed.scores?.keywords     ?? 50,
        formatting:   parsed.scores?.formatting   ?? 65,
        grammar:      parsed.scores?.grammar      ?? 80,
        impact:       parsed.scores?.impact       ?? 45,
        completeness: parsed.scores?.completeness ?? 60,
      };

      const normalizedRadar = (parsed.radarData && Array.isArray(parsed.radarData) && parsed.radarData.length > 0)
        ? parsed.radarData
        : [
            { subject: 'ATS',        score: normalizedScores.ats,        full: 100 },
            { subject: 'Keywords',   score: normalizedScores.keywords,   full: 100 },
            { subject: 'Impact',     score: normalizedScores.impact,     full: 100 },
            { subject: 'Formatting', score: normalizedScores.formatting, full: 100 },
            { subject: 'Grammar',    score: normalizedScores.grammar,    full: 100 },
          ];

      const presentKeywords = parsed.keywords?.present || [];
      const missingKeywords = parsed.keywords?.missing || [];

      const normalized = {
        scores: normalizedScores,
        radarData: normalizedRadar,
        keywords: {
          present:  presentKeywords,
          missing:  missingKeywords,
          overused: parsed.keywords?.overused || [],
        },
        sections: (parsed.sections && Array.isArray(parsed.sections))
          ? parsed.sections
          : [{ name: "General Content", score: normalizedScores.overall, status: normalizedScores.overall >= 70 ? "strong" : "weak", feedback: "Resume evaluated." }],
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
        recruiterSim: {
          pros:            parsed.recruiterSim?.pros            || ["Resume structural review complete"],
          cons:            parsed.recruiterSim?.cons            || [],
          redFlags:        parsed.recruiterSim?.redFlags        || [],
          questions:       parsed.recruiterSim?.questions       || [],
          interviewChance: parsed.recruiterSim?.interviewChance || normalizedScores.overall,
        },
        placementScore: parsed.placementScore || {
          resume: normalizedScores.overall, coding: 50, communication: 50, projects: 50, certifications: 50, internships: 50, aptitude: 50
        },
        companies: buildCompanies(presentKeywords),
      };

      setAnalysisResult(normalized);
      setAnalysisId(id => id + 1);
      setState('results');

      // Save normalized result directly to DB
      try {
        await api.post('/resume/save-result', {
          filename: file.name,
          analysis: normalized,
        });
      } catch (saveErr) {
        console.warn('Could not save resume to DB:', saveErr.message);
      }

    } catch (e) {
      console.error('Analysis failed:', e);
      setAnalysisError(e.message || 'Failed to analyze resume. Please try again.');
      setState('error');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setState('upload');
    setFileName('');
    setTab('scores');
    setAnalysisResult(null);
    setAnalysisError('');
  };

  return (
    <div className="fade-in" style={{ fontFamily: 'inherit' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary,#e0e0ff)', margin: '0 0 5px' }}>AI Resume Analyzer</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary,#8888aa)', margin: 0 }}>
            ATS scoring · Keyword analysis · Bullet rewriter · Company readiness · Recruiter simulation
          </p>
        </div>
        {state === 'results' && (
          <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color,#2a2a4a)', background: 'transparent', color: 'var(--text-secondary,#8888aa)', cursor: 'pointer', fontSize: '0.83rem' }}>
            <Upload size={14} /> New Resume
          </button>
        )}
      </div>

      {state === 'upload'  && <UploadScreen onAnalyze={runAnalysis} />}
      {state === 'loading' && <AnalyzingScreen />}
      {state === 'error'   && <ErrorScreen error={analysisError} onRetry={reset} />}

      {state === 'results' && analysisResult && (
        <div key={analysisId} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, background: 'var(--bg-secondary,#1a1a2e)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <FileText size={20} style={{ color: '#22d3ee' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary,#e0e0ff)' }}>{fileName}</div>
              <div style={{ fontSize: '0.72rem', color: '#34d399' }}>✓ Analysis complete — Overall Score: {analysisResult.scores.overall}/100</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary,#1a1a2e)', padding: 5, borderRadius: 10, border: '1px solid var(--border-color,#2a2a4a)', overflowX: 'auto' }}>
            {TABS.map(t => <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} icon={t.icon} label={t.label} />)}
          </div>

          {tab === 'scores'    && <ScoresTab    r={analysisResult} />}
          {tab === 'keywords'  && <KeywordsTab  r={analysisResult} />}
          {tab === 'improve'   && <AIImproveTab r={analysisResult} />}
          {tab === 'company'   && <CompanyTab   r={analysisResult} />}
          {tab === 'recruiter' && <RecruiterTab r={analysisResult} />}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;