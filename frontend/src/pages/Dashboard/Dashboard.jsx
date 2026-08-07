import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { studyService } from '../../services/studyService';
import { skillService } from '../../services/skillService';
import { codingService } from '../../services/codingService';
import { placementService } from '../../services/placementService';
import { userService } from '../../services/userService';
import {
  GraduationCap,
  BarChart2,
  FileText,
  Briefcase,
  Clock,
  Flame,
  TrendingUp,
  Award,
  Brain,
  Code2,
  Target,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Mic,
  Cpu,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/* ─────────────────────────────────────────────
   DESIGN TOKENS — single source of truth
───────────────────────────────────────────── */
const T = {
  purple:    '#0ea5e9', /* Sky Blue Accent */
  purpleL:   'rgba(14,165,233,0.10)',
  purpleM:   'rgba(14,165,233,0.20)',
  blue:      '#0284c7', /* Deep Sky Blue */
  blueL:     'rgba(2,132,199,0.10)',
  cyan:      '#0891B2',
  cyanL:     'rgba(8,145,178,0.10)',
  emerald:   '#059669',
  emeraldL:  'rgba(5,150,105,0.10)',
  rose:      '#E11D48',
  roseL:     'rgba(225,29,72,0.10)',
  amber:     '#D97706',
  amberL:    'rgba(217,119,6,0.10)',
  bg:        'var(--bg-app, #f0f7ff)',
  surface:   'var(--bg-surface, #ffffff)',
  surfaceEl: 'var(--bg-elevated, #e0f2fe)',
  border:    'var(--border, #bae6fd)',
  borderHov: 'var(--border-hov, rgba(14,165,233,0.25))',
  text1:     'var(--text-1, #0f172a)',
  text2:     'var(--text-2, #334155)',
  text3:     'var(--text-3, #64748b)',
  radius:    '14px',
  radiusSm:  '10px',
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg-app:      var(--bg-primary);
      --bg-surface:  var(--bg-secondary);
      --bg-elevated: var(--bg-tertiary);
      --border:      var(--border-color);
      --border-hov:  rgba(14, 165, 233, 0.25);
      --text-1:      var(--text-primary);
      --text-2:      var(--text-secondary);
      --text-3:      var(--text-muted);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .anv-dashboard {
      min-height: 100vh;
      background: var(--bg-app);
      color: var(--text-1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 32px 40px 64px;
      max-width: 1440px;
    }

    .anv-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      transition: border-color 0.18s;
      min-width: 0;
      overflow: hidden;
    }
    .anv-card:hover { border-color: var(--border-hov); }

    .anv-stat {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .anv-action {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      transition: border-color 0.18s, background 0.18s;
      cursor: pointer;
    }
    .anv-action:hover {
      border-color: var(--border-hov);
      background: rgba(14,165,233,0.06);
    }

    .anv-task-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .anv-skill-bar-track {
      height: 6px;
      border-radius: 100px;
      background: var(--bg-elevated);
      overflow: hidden;
    }
    .anv-skill-bar-fill {
      height: 100%;
      border-radius: 100px;
      transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
    }

    .anv-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 4px 10px;
      border-radius: 100px;
    }

    .anv-chip {
      font-size: 11px;
      font-weight: 500;
      padding: 3px 9px;
      border-radius: 100px;
    }

    .anv-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .anv-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .anv-grid-3 {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 1200px) {
      .anv-grid-4 { grid-template-columns: repeat(2, 1fr); }
      .anv-grid-3 { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .anv-dashboard { padding: 20px 16px 48px; }
      .anv-grid-4  { grid-template-columns: 1fr 1fr; }
      .anv-grid-2  { grid-template-columns: 1fr; }
      .anv-grid-3  { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .anv-grid-4  { grid-template-columns: 1fr; }
    }

    .recharts-tooltip-wrapper { outline: none; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

const Badge = ({ color, bg, icon: Icon, children }) => (
  <span className="anv-badge" style={{ background: bg, color }}>
    {Icon && <Icon size={11} />}
    {children}
  </span>
);

const StatCard = ({ icon: Icon, label, value, sub, accentColor, accentBg, trend }) => (
  <div className="anv-stat">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '10px',
        background: accentBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: accentColor, flexShrink: 0
      }}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#059669' }}>
          <ArrowUpRight size={13} /> {trend}%
        </span>
      )}
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{label}</div>
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        {sub}
      </div>
    )}
  </div>
);

const ReadinessRing = ({ pct, label, color }) => {
  const R = 30, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={76} height={76} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={R} fill="none" stroke="var(--bg-elevated)" strokeWidth={7}/>
        <circle cx={38} cy={38} r={R} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${C}`} strokeDashoffset={C * 0.25}
          strokeLinecap="round" />
        <text x={38} y={42} textAnchor="middle" fill={color}
          style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'center', maxWidth: 72 }}>{label}</span>
    </div>
  );
};

const SkillRow = ({ name, level, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{name}</span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{level}%</span>
    </div>
    <div className="anv-skill-bar-track">
      <div className="anv-skill-bar-fill" style={{ width: `${level}%`, background: color }}/>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 13px', fontSize: 13
    }}>
      <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#7C3AED', fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const SectionHead = ({ icon: Icon, title, iconColor, to, linkText }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ color: iconColor }}><Icon size={17} /></div>
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{title}</span>
    </div>
    {to && (
      <Link to={to} style={{
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 12, color: 'var(--text-2)', textDecoration: 'none'
      }}>
        {linkText} <ChevronRight size={13} />
      </Link>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]           = useState(true);
  const [studyStats, setStudyStats]     = useState({ count: 0, avgProgress: 0 });
  const [skills, setSkills]             = useState([]);
  const [codingStreak, setCodingStreak] = useState(0);
  const [placementCount, setPlacementCount] = useState(0);
  const [recentTasks, setRecentTasks]   = useState([]);
  const [dbPlacements, setDbPlacements] = useState([]);
  const [stats, setStats]               = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [plans, skillsData, codingData, placementData, dashboardStats] = await Promise.all([
          studyService.getPlans(),
          skillService.getSkills(),
          codingService.getStats(),
          placementService.getApplications(),
          userService.getDashboardStats(),
        ]);

        const planCount = plans.length;
        const totalProg = plans.reduce((a, p) => a + p.progress, 0);
        const avgProg   = planCount > 0 ? Math.round(totalProg / planCount) : 0;

        setStudyStats({ count: planCount, avgProgress: avgProg });
        setSkills(skillsData);
        setCodingStreak(codingData.streak || dashboardStats.coding_streak || 0);
        setPlacementCount(placementData.length);
        setDbPlacements(placementData);
        setStats(dashboardStats);

        const tasks = [];
        plans.forEach(plan =>
          plan.tasks.forEach(task => {
            if (!task.completed && tasks.length < 4)
              tasks.push({ ...task, planTitle: plan.title });
          })
        );
        setRecentTasks(tasks);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  /* ── Static demo / fallback data ── */
  const trendData = [
    { month: 'Jan', score: 52 }, { month: 'Feb', score: 58 },
    { month: 'Mar', score: 64 }, { month: 'Apr', score: 62 },
    { month: 'May', score: 70 }, { month: 'Jun', score: 81 },
  ];

  const activityData = [
    { day: 'Mon', hrs: 2.5 }, { day: 'Tue', hrs: 3.8 },
    { day: 'Wed', hrs: 1.2 }, { day: 'Thu', hrs: 4.1 },
    { day: 'Fri', hrs: 2.9 }, { day: 'Sat', hrs: 5.3 }, { day: 'Sun', hrs: 3.0 },
  ];

  const skillRows = skills.length > 0
    ? skills.slice(0, 5).map((s, i) => ({
        name: s.subject || s.name,
        level: s.A ?? s.score ?? 0,
        color: ['#0ea5e9', '#0284c7', '#0891B2', '#059669', '#D97706'][i % 5]
      }))
    : [];


  const readiness = [
    { pct: stats?.readiness_technical ?? 0, label: 'Technical Skills', color: '#0ea5e9' },
    { pct: stats?.readiness_resume    ?? 0, label: 'Resume Score',     color: '#0891B2' },
    { pct: stats?.readiness_interview ?? 0, label: 'Interview Ready',  color: '#059669' },
  ];

  const quickActions = [
    { to: '/study',     icon: BookOpen, label: 'Study Planner',   sub: "Today's schedule",    color: '#0284c7' },
    { to: '/skills',    icon: Cpu,      label: 'Skill Analyzer',  sub: 'Assess skills & gaps', color: '#059669' },
    { to: '/resume',    icon: FileText, label: 'Resume Analyzer', sub: 'ATS check & score',   color: '#0891B2' },
    { to: '/interview', icon: Mic,      label: 'Mock Interview',  sub: 'AI-powered practice', color: '#0ea5e9' },
    { to: '/projects',  icon: Code2,    label: 'Project Recommendations', sub: 'Custom build ideas', color: '#34D399' },
    { to: '/coding',    icon: Code2,    label: 'Coding Tracker',  sub: 'LeetCode progress',   color: '#E11D48' },
    { to: '/placements', icon: Briefcase, label: 'Placement Tracker', sub: 'Manage applications', color: '#F59E0B' },
    { to: '/mentor',    icon: Brain,    label: 'AI Mentor',       sub: 'Personal career coach', color: '#38bdf8' },

  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Anbu';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const displayTasks = recentTasks.length > 0 ? recentTasks : [];

  if (loading) {
    return (
      <div style={{
        display: 'flex', height: '70vh', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 14,
        background: 'var(--bg-primary)', color: 'var(--text-secondary)'
      }}>
        <LoadingSpinner size="md" />
        <span style={{ fontSize: 14 }}>Loading your workspace…</span>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="anv-dashboard">

        {/* ── HEADER ─────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', marginBottom: 36,
          flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '0.07em',
                color: 'var(--text-2)', textTransform: 'uppercase'
              }}>
                Anviora
              </span>
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, color: 'var(--text-1)'
            }}>
              {greeting}, {firstName} 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>
              {dateStr} — here's where your journey stands today.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(217,119,6,0.10)',
            border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: 100, padding: '10px 18px'
          }}>
            <Flame size={17} color="#D97706" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>
              {codingStreak} day streak
            </span>
          </div>
        </div>

        {/* ── STAT ROW ──────────────────────────── */}
        <div className="anv-grid-4" style={{ marginBottom: 24 }}>
          <StatCard
            icon={GraduationCap} label="Study tracks active"
            value={studyStats.count}
            sub={studyStats.count > 0 ? `${studyStats.avgProgress}% average completion` : 'No study plans yet'}
            accentColor="#0ea5e9" accentBg="rgba(14,165,233,0.10)"
          />
          <StatCard
            icon={BarChart2} label="Skills assessed"
            value={skills.length}
            sub={skills.length > 0 ? `Across your profile` : 'No skills added yet'}
            accentColor="#0284c7" accentBg="rgba(2,132,199,0.10)"
          />
          <StatCard
            icon={FileText} label="Resume ATS score"
            value={stats ? `${stats.resume_score} / 100` : "78 / 100"}
            sub={stats && stats.resume_score > 0 ? "Latest resume upload" : "No resume uploaded yet"}
            accentColor="#0891B2" accentBg="rgba(8,145,178,0.10)"
          />
          <StatCard
            icon={Briefcase} label="Active applications"
            value={placementCount}
            sub={placementCount > 0 ? 'Tracking your applications' : 'No applications yet'}
            accentColor="#E11D48" accentBg="rgba(225,29,72,0.10)"
          />
        </div>

        {/* ── ROW 2: Charts ─────────────────────── */}
        <div className="anv-grid-2" style={{ marginBottom: 24 }}>

          {/* Skill Growth Trend */}
          <div className="anv-card">
            <SectionHead icon={TrendingUp} title="Skill Growth Trend" iconColor="#0ea5e9" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>+29</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>pts since January</span>
              <span className="anv-badge" style={{ background: 'rgba(5,150,105,0.10)', color: '#059669' }}>
                <ArrowUpRight size={11} /> +6.5% this month
              </span>
            </div>
            <div style={{ height: 200, width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={150}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#0ea5e9" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} domain={[40, 100]}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" name="Score"
                    stroke="#0ea5e9" strokeWidth={2} fill="url(#pgGrad)"
                    dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Study Activity */}
          <div className="anv-card">
            <SectionHead icon={Clock} title="Weekly Study Activity" iconColor="#0891B2" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>22.8h</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>this week</span>
            </div>
            <div style={{ height: 200, width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={150}>
                <BarChart data={activityData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hrs" name="Hours" fill="#0891B2" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Skills + Readiness + Tasks ──── */}
        <div className="anv-grid-3" style={{ marginBottom: 24 }}>

          {/* Skill Breakdown */}
          <div className="anv-card">
            <SectionHead icon={Brain} title="Skill Breakdown" iconColor="#2563EB"
              to="/skills" linkText="Run assessment" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {skillRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3, #5E5C7A)', fontSize: 13 }}>
                  No skills tracked yet. <br />
                  <a href="/skills" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Go to Skill Analyzer →</a>
                </div>
              ) : skillRows.map(s => <SkillRow key={s.name} {...s} />)}
            </div>
          </div>

          {/* Real-Time Talent IQs */}
          <div className="anv-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHead icon={Target} title="Real-Time Talent IQs" iconColor="#059669" />
            
            {/* Placement IQ & Readiness Time */}
            <div style={{
              display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-elevated, #1C1C26)',
              padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)'
            }}>
              <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                <ReadinessRing pct={stats?.placement_iq ?? 50} color="#059669" label="" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 500 }}>Placement IQ</span>
                <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Est. Readiness Time:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706' }}>
                  {stats?.readiness_time ?? '2-3 months'}
                </span>
              </div>
            </div>

            {/* Role IQs */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role IQs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stats?.role_iqs ?? {
                  "AI Engineer": 50,
                  "Web Developer": 50,
                  "Backend Developer": 50,
                  "DevOps Engineer": 50
                }).map(([role, score]) => (
                  <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-1)' }}>{role}</span>
                      <span style={{ color: '#a78bfa', fontWeight: 600 }}>{score} IQ</span>
                    </div>
                    <div className="anv-skill-bar-track" style={{ height: 4 }}>
                      <div className="anv-skill-bar-fill" style={{ width: `${score}%`, background: '#7C3AED' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company IQs */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Readiness</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(stats?.company_iqs ?? {
                  "Google": 50, "Amazon": 50, "Microsoft": 50, "Zoho": 50, "TCS": 50, "Infosys": 50
                }).slice(0, 6).map(([company, score]) => (
                  <div key={company} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-1)' }}>{company}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee' }}>{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="anv-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionHead icon={CheckCircle2} title="Today's Tasks" iconColor="#E11D48"
              to="/study" linkText="View planner" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {displayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3, #5E5C7A)', fontSize: 13 }}>
                  No pending tasks. <br />
                  <a href="/study" style={{ color: '#E11D48', textDecoration: 'none', fontWeight: 600 }}>Create a study plan →</a>
                </div>
              ) : displayTasks.map(task => (
                <div key={task.id} className="anv-task-row">
                  <Circle size={16} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{task.text}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{task.planTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 4: Applications + Quick Actions ── */}
        <div className="anv-grid-2">

          {/* Placement Pipeline */}
          <div className="anv-card">
            <SectionHead icon={Briefcase} title="Placement Pipeline" iconColor="#E11D48"
              to="/placements" linkText="View all" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dbPlacements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3, #5E5C7A)', fontSize: 13 }}>
                  No placement applications yet.
                </div>
              ) : dbPlacements.slice(0, 4).map((p, i) => (
                <div key={p.id || i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{p.company_name || p.company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{p.role || p.position}</div>
                  </div>
                  <span className="anv-chip" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
                    {p.status || 'Applied'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launch */}
          <div className="anv-card" style={{ gridColumn: '1 / -1' }}>
            <SectionHead icon={Sparkles} title="Jump Back In" iconColor="#D97706" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {quickActions.map(({ to, icon: Icon, label, sub, color }) => (
                <Link key={to} to={to} className="anv-action">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color, flexShrink: 0
                    }}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{sub}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;