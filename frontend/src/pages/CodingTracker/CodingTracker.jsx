import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { callAI, extractJSON } from '../../services/api';
import { codingService } from '../../services/codingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Flame, Send, CheckCircle, Brain, Target, Trophy,
  Code2, RefreshCw, Zap, BarChart3, Building2,
  GitBranch, Clock, AlertCircle, BookOpen, Play,
  Lightbulb, TrendingUp, Star, ArrowRight, Rocket,
  Edit3
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'HashMap', 'Trees', 'BST', 'Graphs', 'DP',
  'Greedy', 'Binary Search', 'Backtracking', 'Recursion', 'Trie',
  'Heap', 'Sliding Window', 'Bit Manipulation', 'Math', 'Segment Tree',
];

const PLATFORMS = ['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'AtCoder'];

const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Zoho', 'Freshworks', 'TCS', 'Infosys', 'Wipro'
];

const DIFF_COLORS = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };
const STATUS_COLORS = { Accepted: '#4ade80', 'Wrong Answer': '#f87171', 'Time Limit Exceeded': '#fb923c' };

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',    icon: BarChart3 },
  { id: 'log',        label: 'Log Problem',  icon: Edit3 },
  { id: 'topics',     label: 'Topics',       icon: BookOpen },
  { id: 'company',    label: 'Company Prep', icon: Building2 },
  { id: 'simulator',  label: 'Simulator',    icon: Rocket },
  { id: 'mentor',     label: 'AI Mentor',    icon: Brain },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const callAIJSON = async (userPrompt, systemPrompt) => {
  const text = await callAI(userPrompt, systemPrompt);
  const cleanJson = extractJSON(text);
  return JSON.parse(cleanJson);
};

const today = () => new Date().toISOString().split('T')[0];

const last70Days = () => {
  const days = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split('T')[0], count: 0 });
  }
  return days;
};

const heatColor = (count, isDarkMode) => {
  if (!count) return isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.05)';
  if (count === 1) return 'rgba(167,139,250,0.25)';
  if (count === 2) return 'rgba(167,139,250,0.5)';
  if (count === 3) return 'rgba(167,139,250,0.75)';
  return 'var(--accent-purple)';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Chip = ({ label, color = '#a78bfa', small }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: small ? '2px 8px' : '3px 11px', borderRadius: 99,
    fontSize: small ? '0.68rem' : '0.72rem', fontWeight: 700,
    background: `${color}18`, color, border: `1px solid ${color}35`,
  }}>{label}</span>
);

const StatCard = ({ label, value, sub, color = 'var(--accent-purple)', icon: Icon }) => (
  <div style={{
    background: 'var(--bg-secondary)', border: `1px solid var(--border-color)`,
    borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--shadow-sm)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.07em', marginBottom: 4 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
      {Icon && <Icon size={20} style={{ color: `var(--text-muted)` }} />}
    </div>
  </div>
);

const ScoreBar = ({ label, value, color = 'var(--accent-purple)', max = 100 }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 800 }}>{value}%</span>
    </div>
    <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CodingTracker = () => {
  const { isDarkMode } = useTheme();

  // ── Core State ──────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('dashboard');
  const [submissions,   setSubmissions]   = useState([]);
  const [heatmap,       setHeatmap]       = useState(last70Days());
  const [streak,        setStreak]        = useState(0);
  const [solvedStats,   setSolvedStats]   = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [topicProgress, setTopicProgress] = useState(
    Object.fromEntries(TOPICS.map(t => [t, { solved: 0, wrong: 0 }]))
  );

  // ── Log Form ─────────────────────────────────────────────────────────────────
  const [logTitle,      setLogTitle]      = useState('');
  const [logDiff,       setLogDiff]       = useState('Medium');
  const [logStatus,     setLogStatus]     = useState('Accepted');
  const [logTopic,      setLogTopic]      = useState('Arrays');
  const [logPlatform,   setLogPlatform]   = useState('LeetCode');
  const [logNotes,      setLogNotes]      = useState('');
  const [logLoading,    setLogLoading]    = useState(false);
  const [logSuccess,    setLogSuccess]    = useState(false);
  const [aiFeedback,    setAiFeedback]    = useState('');

  // ── Company Prep ─────────────────────────────────────────────────────────────
  const [company,       setCompany]       = useState('Google');
  const [companyResult, setCompanyResult] = useState(null);
  const [companyLoading,setCompanyLoading]= useState(false);

  // ── Simulator ────────────────────────────────────────────────────────────────
  const [simGoals,      setSimGoals]      = useState({ problems: 200, contests: 10, commits: 300 });
  const [simResult,     setSimResult]     = useState(null);
  const [simLoading,    setSimLoading]    = useState(false);

  // ── Mentor ───────────────────────────────────────────────────────────────────
  const [mentorQ,       setMentorQ]       = useState('');
  const [mentorReply,   setMentorReply]   = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);

  const [userTimezone, setUserTimezone] = useState('Asia/Kolkata');
  const [streakFreezes, setStreakFreezes] = useState(2);

  // ── Code Sandbox Runner ───────────────────────────────────────────────────────
  const [runnerLang, setRunnerLang] = useState('python');
  const [runnerCode, setRunnerCode] = useState('def solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(solve([2, 7, 11, 15], 9))');
  const [runnerInput, setRunnerInput] = useState('');
  const [runnerExpected, setRunnerExpected] = useState('[0, 1]');
  const [runnerResult, setRunnerResult] = useState(null);
  const [runnerLoading, setRunnerLoading] = useState(false);

  // ── Daily Reco ───────────────────────────────────────────────────────────────
  const [dailyReco,     setDailyReco]     = useState(null);
  const [recoLoading,   setRecoLoading]   = useState(false);

  // ── Load from DB on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        // Load stats + submissions from DB
        const stats = await codingService.getStats();
        setStreak(stats.streak || 0);
        setUserTimezone(stats.timezone || 'Asia/Kolkata');
        setStreakFreezes(stats.streakFreezesRemaining ?? 2);
        setSolvedStats({
          easy: stats.easySolved || 0,
          medium: stats.mediumSolved || 0,
          hard: stats.hardSolved || 0,
          total: stats.solvedCount || 0
        });
        if (stats.recentSubmissions && stats.recentSubmissions.length > 0) {
          const mapped = stats.recentSubmissions.map(r => ({
            title: r.title,
            difficulty: r.difficulty,
            status: r.status,
            topic: r.topic || 'Arrays',
            platform: r.platform || 'LeetCode',
            notes: r.notes || '',
            date: r.date,
          }));
          setSubmissions(mapped);

          // Build topicProgress dynamically from submissions
          const tMap = Object.fromEntries(TOPICS.map(t => [t, { solved: 0, wrong: 0 }]));
          mapped.forEach(s => {
            const tKey = TOPICS.includes(s.topic) ? s.topic : 'Arrays';
            if (s.status === 'Accepted') {
              tMap[tKey].solved += 1;
            } else {
              tMap[tKey].wrong += 1;
            }
          });
          setTopicProgress(tMap);
        }
      } catch (e) {
        console.warn('Could not load coding stats from DB', e);
      }

      try {
        const activity = await codingService.generateActivityData();
        if (activity && activity.length > 0) {
          setHeatmap(activity);
        }
      } catch (e) {
        console.warn('Could not load activity data', e);
      }

      try {
        // Load latest saved daily recommendation
        const suggestions = await codingService.getCodingSuggestions();
        if (suggestions && suggestions.length > 0) {
          const latest = suggestions[0]; // newest first
          try {
            const parsed = JSON.parse(latest.content);
            setDailyReco(parsed);
          } catch {}
        }
      } catch (e) {
        console.warn('Could not load coding suggestions from DB', e);
      }
    };
    loadFromDB();
  }, []);

  // ── Computed Stats ────────────────────────────────────────────────────────────
  const total    = solvedStats.total;
  const easy     = solvedStats.easy;
  const medium   = solvedStats.medium;
  const hard     = solvedStats.hard;
  const accepted = total;
  const accuracy = submissions.length ? Math.round((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100) : 100;

  const weakTopics = TOPICS
    .filter(t => topicProgress[t].wrong > topicProgress[t].solved)
    .slice(0, 4);

  // ── Log Problem ───────────────────────────────────────────────────────────────
  const handleLog = async () => {
    if (!logTitle.trim()) return;
    setLogLoading(true);
    setAiFeedback('');

    const entry = {
      title: logTitle, difficulty: logDiff, status: logStatus,
      topic: logTopic, platform: logPlatform, notes: logNotes,
      date: today(),
    };
    const updated = [entry, ...submissions].slice(0, 50);
    setSubmissions(updated);

    // Update heatmap
    setHeatmap(prev => prev.map(d =>
      d.date === today() ? { ...d, count: d.count + 1 } : d
    ));

    // Update streak
    setStreak(s => s + (logStatus === 'Accepted' ? 1 : 0));

    // Update solvedStats locally immediately
    if (logStatus === 'Accepted') {
      setSolvedStats(prev => {
        const updatedStats = { ...prev };
        updatedStats.total += 1;
        if (logDiff === 'Easy') updatedStats.easy += 1;
        else if (logDiff === 'Medium') updatedStats.medium += 1;
        else if (logDiff === 'Hard') updatedStats.hard += 1;
        return updatedStats;
      });
    }

    // Update topic map
    setTopicProgress(prev => ({
      ...prev,
      [logTopic]: {
        solved: prev[logTopic].solved + (logStatus === 'Accepted' ? 1 : 0),
        wrong:  prev[logTopic].wrong  + (logStatus !== 'Accepted' ? 1 : 0),
      }
    }));

    // Save to database
    try {
      const res = await codingService.logProblem(logTitle, logDiff, logStatus, logTopic, logPlatform, logNotes);
      if (res) {
        setSolvedStats({
          easy: res.easySolved || 0,
          medium: res.mediumSolved || 0,
          hard: res.hardSolved || 0,
          total: res.solvedCount || 0
        });
        setStreak(res.streak || 0);
        if (res.recentSubmissions && res.recentSubmissions.length > 0) {
          setSubmissions(res.recentSubmissions);
        }
      }
    } catch (e) {
      console.warn('Failed to save problem to DB (local state updated anyway):', e);
    }

    // AI feedback on the problem
    try {
      const fb = await callAI(
        `Problem logged: "${logTitle}", topic: ${logTopic}, difficulty: ${logDiff}, status: ${logStatus}.${logNotes ? ' Notes: ' + logNotes : ''}`,
        `You are ANVIORA's strict, honest coding mentor. Give a brutal, targeted 2-sentence feedback: point out real potential weaknesses in solving this type of problem, and provide a concrete, advanced optimization tip. Avoid false praise or generic encouragement. Max 60 words.`
      );
      setAiFeedback(fb);
    } catch (e) {
      console.error('Failed to get AI feedback on logged problem', e);
    }

    setLogTitle(''); setLogNotes('');
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 3000);
    setLogLoading(false);
  };

  // ── Daily Recommendation ──────────────────────────────────────────────────────
  const [recoError, setRecoError] = useState('');
  const fetchDailyReco = async () => {
    setRecoLoading(true);
    setRecoError('');
    try {
      const result = await callAIJSON(
        `Student stats: ${easy} easy, ${medium} medium, ${hard} hard solved. Streak: ${streak}. Weak topics: ${weakTopics.join(', ') || 'none yet'}. Dream company: ${company}.`,
        `You are ANVIORA's AI Problem Recommender. Be realistic, critical, and specific about the user's solved problem distribution and weak topics. Do not recommend problems that are too easy if they need to stretch, or suggest inflated accomplishments. Respond ONLY with a valid JSON object matching this schema (no markdown, no preamble):
{
  "daily_goal": "<e.g. Solve 2 Medium DP + 1 Hard Graph>",
  "problems": [
    { "title": "<problem name>", "platform": "<LeetCode|Codeforces etc>", "difficulty": "<Easy|Medium|Hard>", "topic": "<topic>", "why": "<brutally honest reason based on their gaps>" },
    { "title": "<problem name>", "platform": "<platform>", "difficulty": "<Easy|Medium|Hard>", "topic": "<topic>", "why": "<brutally honest reason based on their gaps>" },
    { "title": "<problem name>", "platform": "<platform>", "difficulty": "<Easy|Medium|Hard>", "topic": "<topic>", "why": "<brutally honest reason based on their gaps>" }
  ],
  "revision_topic": "<one topic to revise today>",
  "motivation": "<one brutally honest statement about their coding state, no sugarcoating>"
}`
      );
      setDailyReco(result);
      // Persist to DB so it loads next time
      try {
        await codingService.saveCodingSuggestion(JSON.stringify(result));
      } catch (saveErr) {
        console.warn('Could not save daily reco to DB:', saveErr);
      }
    } catch (e) {
      console.error(e);
      setRecoError('Failed to load daily recommendations. Please check if your backend is running.');
    }
    setRecoLoading(false);
  };

  // ── Company Prep ──────────────────────────────────────────────────────────────
  const [companyError, setCompanyError] = useState('');
  const fetchCompanyPrep = async () => {
    setCompanyLoading(true);
    setCompanyResult(null);
    setCompanyError('');
    try {
      const result = await callAIJSON(
        `Student: ${easy} easy, ${medium} medium, ${hard} hard solved. Topics progress: ${JSON.stringify(topicProgress)}. Target company: ${company}.`,
        `You are ANVIORA's Dream Company Coding Engine. Evaluate the student's preparation level strictly and realistically against top tier industry bars. If they have only solved a few easy problems, their readiness score must be low (e.g. 10-30). Do not inflate readiness scores or give false confidence. Respond ONLY with a valid JSON object matching this schema (no markdown, no explanation):
{
  "readiness": <1-100 integer representing actual strict readiness, be brutal and realistic>,
  "target": 95,
  "missing_topics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"],
  "strong_topics": ["<topic1>", "<topic2>"],
  "problems_needed": <50-500 representing a realistic gap to hit target>,
  "company_focus": ["<key area 1>", "<key area 2>", "<key area 3>"],
  "roadmap": [
    { "week": "Week 1-2", "focus": "<brutally realistic task>" },
    { "week": "Week 3-4", "focus": "<brutally realistic task>" },
    { "week": "Week 5-6", "focus": "<brutally realistic task>" },
    { "week": "Week 7-8", "focus": "<brutally realistic task>" }
  ],
  "verdict": "<one brutally honest sentence about current readiness, pointing out gaps>"
}`
      );
      setCompanyResult(result);
    } catch (e) {
      console.error(e);
      setCompanyError('Failed to analyze company readiness. Please check if your backend is running.');
    }
    setCompanyLoading(false);
  };

  // ── Simulator ─────────────────────────────────────────────────────────────────
  const [simError, setSimError] = useState('');
  const runSimulator = async () => {
    setSimLoading(true);
    setSimResult(null);
    setSimError('');
    try {
      const result = await callAIJSON(
        `Current: ${total} problems solved, ${streak} streak. Planning to solve ${simGoals.problems} more problems, join ${simGoals.contests} contests, make ${simGoals.commits} GitHub commits. Dream company: ${company}.`,
        `You are ANVIORA's AI Coding Simulator. Model the outcomes strictly and realistically based on the user's inputs. Do not inflate predictions or placement probabilities. If the timeline is too short or goals are unrealistic, reflect that in low gains and a critical verdict. Respond ONLY with a valid JSON object matching this schema (no markdown, no explanation):
{
  "coding_score_before": <1-100 representing actual strict score before, be brutal>,
  "coding_score_after": <1-100 representing realistic, non-inflated score after>,
  "dsa_score_before": <1-100, brutal>,
  "dsa_score_after": <1-100, realistic>,
  "placement_prob_before": <1-100, brutal>,
  "placement_prob_after": <1-100, realistic>,
  "company_readiness_before": <1-100, brutal>,
  "company_readiness_after": <1-100, realistic>,
  "contest_rating_gain": "<e.g. +100 rating>",
  "github_boost": "<e.g. 50 → 150 contributions>",
  "timeline_weeks": <realistic number of weeks to achieve the goal>,
  "new_skills": ["<skill1>", "<skill2>", "<skill3>"],
  "verdict": "<one brutally honest verdict about the viability of this plan and real bottlenecks>"
}`
      );
      setSimResult(result);
    } catch (e) {
      console.error(e);
      setSimError('Failed to run growth simulation. Please check if your backend is running.');
    }
    setSimLoading(false);
  };

  // ── Mentor ────────────────────────────────────────────────────────────────────
  const [mentorError, setMentorError] = useState('');
  const askMentor = async () => {
    if (!mentorQ.trim()) return;
    setMentorLoading(true);
    setMentorReply('');
    setMentorError('');
    try {
      const reply = await callAI(
        mentorQ,
        `You are ANVIORA's AI Coding Mentor — a brutally honest, strict expert in DSA, competitive programming, and placement prep.
Student profile: ${easy} easy + ${medium} medium + ${hard} hard solved. Streak: ${streak} days. Weak topics: ${weakTopics.join(', ') || 'none detected yet'}. Dream company: ${company}.
Analyze their stats strictly. Give realistic, direct, and critical advice about what they are missing and where they fall short. Avoid false hope or generic positivity. Max 120 words. No markdown headers.`
      );
      setMentorReply(reply);
    } catch (e) {
      console.error(e);
      setMentorError('Failed to reach AI mentor. Please check if your backend is running.');
    }
    setMentorLoading(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────────

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
    input: {
      width: '100%', background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)', borderRadius: 10,
      padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.875rem',
      outline: 'none', boxSizing: 'border-box',
    },
    select: {
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)', borderRadius: 10,
      padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem',
      outline: 'none', cursor: 'pointer',
    },
    primaryBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '10px 22px', borderRadius: 10, fontWeight: 700,
      fontSize: '0.875rem', cursor: 'pointer', border: 'none',
      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
      color: '#fff', transition: 'opacity 0.2s',
    },
    tab: (active) => ({
      padding: '9px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem',
      cursor: 'pointer', border: 'none',
      background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
      color: active ? 'var(--accent-purple)' : 'var(--text-secondary)',
      borderBottom: active ? '2px solid var(--accent-purple)' : '2px solid transparent',
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }),
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: "rgba(167, 139, 250, 0.15)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
          <Code2 size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: -0.3 }}>AI Coding OS</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>From daily grind → dream company offer</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8, borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.tab(activeTab === t.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <t.icon size={13} />
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Key Stats */}
          <div style={S.grid4}>
            <StatCard label="Total Solved"   value={total}    sub="problems"         color="var(--accent-purple)" icon={Code2}    />
            <StatCard label="Streak"         value={`${streak} Days`} sub={`❄️ ${streakFreezes} Freezes (${userTimezone})`} color="#fb923c" icon={Flame}    />
            <StatCard label="Accuracy"       value={`${accuracy}%`} sub={`${accepted}/${total} accepted`} color="#4ade80" icon={Target}   />
            <StatCard label="Hard Solved"    value={hard}     sub="problems"         color="#f87171" icon={Trophy}   />
          </div>

          {/* Difficulty breakdown */}
          <div style={S.card}>
            <span style={S.label}>Difficulty Breakdown</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['Easy', easy, '#4ade80'], ['Medium', medium, '#fbbf24'], ['Hard', hard, '#f87171']].map(([d, v, c]) => (
                <div key={d} style={{ textAlign: 'center', padding: '16px', background: `${c}10`, border: `1px solid ${c}25`, borderRadius: 12 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>{d.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div style={S.card}>
            <span style={S.label}>Submission Heatmap — Last 70 Days</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {heatmap.map((d, i) => (
                <div key={i} title={`${d.date}: ${d.count}`}
                  style={{ width: 13, height: 13, borderRadius: 3, background: heatColor(d.count, isDarkMode), cursor: 'default', transition: 'transform 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Less {[0,1,2,3,4].map(c => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: heatColor(c, isDarkMode) }} />
              ))} More
            </div>
          </div>

          {/* Weak Topics + Daily Reco */}
          <div style={S.grid2}>
            <div style={S.card}>
              <span style={S.label}>Weak Topics</span>
              {weakTopics.length === 0
                ? <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log more problems to detect weak areas.</p>
                : weakTopics.map(t => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>{t}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {topicProgress[t].wrong} wrong / {topicProgress[t].solved} solved
                    </span>
                  </div>
                ))
              }
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Today's AI Recommendations
                </span>
                <button onClick={fetchDailyReco} disabled={recoLoading}
                  style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6, padding: '4px 10px',
                    cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {recoLoading ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={11} />}
                  {recoLoading ? 'Loading…' : 'Generate'}
                </button>
              </div>

              {recoError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.8rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, marginBottom: 10 }}>
                  <AlertCircle size={14} /> {recoError}
                </div>
              )}

              {!dailyReco && !recoLoading && (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Click Generate to get AI-curated problems for today.
                </p>
              )}

              {dailyReco && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.08)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                    {dailyReco.daily_goal}
                  </div>
                  {dailyReco.problems?.map((p, i) => (
                    <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</span>
                        <Chip label={p.difficulty} color={DIFF_COLORS[p.difficulty]} small />
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{p.platform} · {p.topic} · {p.why}</div>
                    </div>
                  ))}
                  {dailyReco.revision_topic && (
                    <div style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <BookOpen size={11} />Revise today: <strong>{dailyReco.revision_topic}</strong>
                    </div>
                  )}
                  {dailyReco.motivation && (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{dailyReco.motivation}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          {submissions.length > 0 && (
            <div style={S.card}>
              <span style={S.label}>Recent Submissions</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submissions.slice(0, 8).map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 9,
                    border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</span>
                      <Chip label={s.difficulty} color={DIFF_COLORS[s.difficulty]} small />
                      <Chip label={s.topic} color='var(--accent-blue)' small />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_COLORS[s.status] || 'var(--accent-purple)' }}>{s.status}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.platform}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LOG PROBLEM ─────────────────────────────────────────────────────── */}
      {activeTab === 'log' && (
        <div style={{ maxWidth: 640 }}>
          <div style={S.card}>
            <span style={S.label}>Log a Problem</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <input placeholder="Problem title e.g. Two Sum, Longest Substring..."
                value={logTitle} onChange={e => setLogTitle(e.target.value)}
                style={S.input} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={S.label}>Difficulty</span>
                  <select value={logDiff} onChange={e => setLogDiff(e.target.value)} style={{ ...S.select, width: '100%' }}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <span style={S.label}>Status</span>
                  <select value={logStatus} onChange={e => setLogStatus(e.target.value)} style={{ ...S.select, width: '100%' }}>
                    <option>Accepted</option><option>Wrong Answer</option><option>Time Limit Exceeded</option>
                  </select>
                </div>
                <div>
                  <span style={S.label}>Topic</span>
                  <select value={logTopic} onChange={e => setLogTopic(e.target.value)} style={{ ...S.select, width: '100%' }}>
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <span style={S.label}>Platform</span>
                  <select value={logPlatform} onChange={e => setLogPlatform(e.target.value)} style={{ ...S.select, width: '100%' }}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <textarea placeholder="Notes, approach, what you struggled with (optional)..."
                value={logNotes} onChange={e => setLogNotes(e.target.value)}
                rows={3} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />

              {logSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80',
                  padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700 }}>
                  <CheckCircle size={15} />Logged! Keep the streak going 🔥
                </div>
              ) : (
                <button onClick={handleLog} disabled={logLoading || !logTitle.trim()}
                  style={{ ...S.primaryBtn, opacity: (logLoading || !logTitle.trim()) ? 0.5 : 1 }}>
                  {logLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Logging…</> : <><Send size={14} />Log Problem</>}
                </button>
              )}

              {aiFeedback && (
                <div style={{ padding: '12px 14px', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 5 }}>AI COACH TIP</div>
                  <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{aiFeedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TOPICS ──────────────────────────────────────────────────────────── */}
      {activeTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={S.grid2}>
            {TOPICS.map(t => {
              const tp = topicProgress[t];
              const total_t = tp.solved + tp.wrong;
              const acc = total_t ? Math.round((tp.solved / total_t) * 100) : 0;
              const isWeak = tp.wrong > tp.solved && total_t > 0;
              return (
                <div key={t} style={{ ...S.card, borderColor: isWeak ? 'rgba(248,113,113,0.2)' : 'var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isWeak ? '#f87171' : 'var(--text-primary)' }}>{t}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isWeak && <Chip label='Weak' color='#f87171' small />}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{tp.solved} solved</span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 99 }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(acc, 100)}%`,
                      background: isWeak ? '#f87171' : total_t === 0 ? 'var(--border-color)' : '#4ade80',
                      transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>{total_t} attempts</span>
                    <span>{total_t > 0 ? `${acc}% accuracy` : 'Not started'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COMPANY PREP ────────────────────────────────────────────────────── */}
      {activeTab === 'company' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...S.card, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={S.label}>Select Dream Company</span>
              <select value={company} onChange={e => setCompany(e.target.value)} style={S.select}>
                {COMPANIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={fetchCompanyPrep} disabled={companyLoading}
              style={{ ...S.primaryBtn, marginTop: 18, opacity: companyLoading ? 0.6 : 1 }}>
              {companyLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Analysing…</> : <><Building2 size={14} />Analyse Readiness</>}
            </button>
          </div>

          {companyError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
              <AlertCircle size={14} /> {companyError}
            </div>
          )}

          {companyResult && !companyLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Readiness gauge */}
              <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                  {company.toUpperCase()} READINESS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: companyResult.readiness >= 75 ? '#4ade80' : companyResult.readiness >= 50 ? '#fbbf24' : '#f87171', lineHeight: 1 }}>
                      {companyResult.readiness}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CURRENT</div>
                  </div>
                  <ArrowRight size={24} style={{ color: 'var(--border-color)' }} />
                  <div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1 }}>{companyResult.target}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TARGET</div>
                  </div>
                </div>
                <p style={{ margin: '14px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{companyResult.verdict}"
                </p>
              </div>

              <div style={S.grid2}>
                {/* Missing topics */}
                <div style={S.card}>
                  <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertCircle size={11} />TOPICS TO MASTER
                  </div>
                  {companyResult.missing_topics?.map(t => (
                    <div key={t} style={{ padding: '7px 12px', marginBottom: 6, background: 'rgba(248,113,113,0.05)',
                      border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, fontSize: '0.82rem', color: '#f87171', fontWeight: 700 }}>
                      {t}
                    </div>
                  ))}
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ~{companyResult.problems_needed} more problems needed
                  </div>
                </div>

                {/* Company focus areas */}
                <div style={S.card}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Target size={11} />{company.toUpperCase()} INTERVIEW FOCUS
                  </div>
                  {companyResult.company_focus?.map(f => (
                    <div key={f} style={{ padding: '7px 12px', marginBottom: 6, background: 'rgba(56,189,248,0.05)',
                      border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {f}
                    </div>
                  ))}
                  {companyResult.strong_topics?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700, marginBottom: 6 }}>YOUR STRENGTHS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {companyResult.strong_topics.map(t => <Chip key={t} label={t} color='#4ade80' small />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Roadmap */}
              <div style={S.card}>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12} /> 8-WEEK ROADMAP TO {company.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {companyResult.roadmap?.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 70, fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-purple)', padding: '3px 0', flexShrink: 0 }}>
                        {r.week}
                      </div>
                      <div style={{ flex: 1, padding: '8px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {r.focus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SIMULATOR & JUDGE0 CODE RUNNER ───────────────────────────────────── */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Judge0 Code Sandbox Workspace */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={S.label}>Judge0 Code Sandbox Runner</span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Execute real Python, JavaScript, C++, or Java code in an isolated backend container with time & memory tracking.
                </p>
              </div>
              <select
                value={runnerLang}
                onChange={e => setRunnerLang(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem' }}
              >
                <option value="python">Python 3.8</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC 9.2)</option>
                <option value="java">Java 13</option>
              </select>
            </div>

            <textarea
              rows={8}
              value={runnerCode}
              onChange={e => setRunnerCode(e.target.value)}
              placeholder="Write source code here..."
              style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 14 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>STDIN INPUT</span>
                <textarea rows={2} value={runnerInput} onChange={e => setRunnerInput(e.target.value)} placeholder="Standard input (optional)..." style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.8rem' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>EXPECTED OUTPUT</span>
                <textarea rows={2} value={runnerExpected} onChange={e => setRunnerExpected(e.target.value)} placeholder="Expected output (optional)..." style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.8rem' }} />
              </div>
            </div>

            <button
              onClick={async () => {
                setRunnerLoading(true);
                setRunnerResult(null);
                try {
                  const res = await codingService.runCode(runnerCode, runnerLang, runnerInput, runnerExpected);
                  setRunnerResult(res);
                } catch (err) {
                  setRunnerResult({
                    stdout: '',
                    stderr: 'Failed to reach Judge0 backend API runner.',
                    compile_output: '',
                    status: 'Execution Error',
                    execution_time: 0,
                    memory: 0,
                    is_correct: false
                  });
                } finally {
                  setRunnerLoading(false);
                }
              }}
              disabled={runnerLoading || !runnerCode.trim()}
              style={{ ...S.primaryBtn, width: 'auto', alignSelf: 'flex-start' }}
            >
              {runnerLoading ? (
                <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Executing in Sandbox...</>
              ) : (
                <><Play size={14} /> Run Code in Sandbox</>
              )}
            </button>

            {/* Execution Result Box */}
            {runnerResult && (
              <div style={{ marginTop: 18, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800,
                    background: runnerResult.is_correct ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: runnerResult.is_correct ? '#4ade80' : '#f87171',
                    border: `1px solid ${runnerResult.is_correct ? '#4ade8050' : '#f8717150'}`
                  }}>
                    {runnerResult.status} {runnerResult.is_correct ? '✓' : '✗'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                    <span>⏱ Time: {runnerResult.execution_time}s</span>
                    <span>💾 Memory: {runnerResult.memory} KB</span>
                  </div>
                </div>

                {runnerResult.stdout && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700, marginBottom: 2 }}>STDOUT</div>
                    <pre style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 6, fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-primary)', margin: 0, overflowX: 'auto' }}>
                      {runnerResult.stdout}
                    </pre>
                  </div>
                )}

                {runnerResult.stderr && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, marginBottom: 2 }}>STDERR / RUNTIME ERROR</div>
                    <pre style={{ background: 'rgba(248,113,113,0.08)', padding: 10, borderRadius: 6, fontSize: '0.8rem', fontFamily: 'monospace', color: '#f87171', margin: 0, overflowX: 'auto' }}>
                      {runnerResult.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={S.card}>
            <span style={S.label}>AI Coding Growth Simulator</span>
            <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Set your goals. The AI predicts how your scores change.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
              {[
                { key: 'problems', label: 'Problems to Solve', min: 50, max: 1000, step: 50 },
                { key: 'contests', label: 'Contests to Join', min: 1, max: 100, step: 5 },
                { key: 'commits',  label: 'GitHub Commits',   min: 50, max: 2000, step: 50 },
              ].map(f => (
                <div key={f.key}>
                  <span style={S.label}>{f.label}</span>
                  <input type="number" min={f.min} max={f.max} step={f.step}
                    value={simGoals[f.key]}
                    onChange={e => setSimGoals(g => ({ ...g, [f.key]: +e.target.value }))}
                    style={S.input} />
                </div>
              ))}
            </div>

            <button onClick={runSimulator} disabled={simLoading}
              style={{ ...S.primaryBtn, opacity: simLoading ? 0.6 : 1 }}>
              {simLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Simulating…</> : <><Play size={14} />Run Simulation</>}
            </button>
          </div>

          {simError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginTop: 14 }}>
              <AlertCircle size={14} /> {simError}
            </div>
          )}

          {simResult && !simLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
              <div style={{ ...S.card, borderColor: 'rgba(167,139,250,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 16 }}>SIMULATION RESULTS</div>
                {[
                  { label: 'Coding Score',         before: simResult.coding_score_before,         after: simResult.coding_score_after,         color: 'var(--accent-purple)' },
                  { label: 'DSA Score',             before: simResult.dsa_score_before,            after: simResult.dsa_score_after,            color: 'var(--accent-blue)' },
                  { label: 'Placement Probability', before: simResult.placement_prob_before,       after: simResult.placement_prob_after,       color: '#4ade80' },
                  { label: 'Company Readiness',     before: simResult.company_readiness_before,    after: simResult.company_readiness_after,    color: '#fb923c' },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{s.label}</span>
                      <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 800 }}>+{s.after - s.before}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 800, minWidth: 35 }}>{s.before}%</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.after}%`, background: `linear-gradient(90deg, #f87171, ${s.color})`, borderRadius: 99, transition: 'width 0.9s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: s.color, fontWeight: 800, minWidth: 35 }}>{s.after}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={S.grid2}>
                <div style={{ ...S.card, borderColor: 'rgba(74,222,128,0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: 8 }}>SKILLS YOU'LL UNLOCK</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {simResult.new_skills?.map(s => <Chip key={s} label={s} color='#4ade80' small />)}
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    GitHub: {simResult.github_boost} · Timeline: {simResult.timeline_weeks} weeks
                  </div>
                </div>
                <div style={{ ...S.card, borderColor: 'rgba(56,189,248,0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 8 }}>CONTEST RATING</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{simResult.contest_rating_gain}</div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, fontStyle: 'italic' }}>
                    "{simResult.verdict}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI MENTOR ───────────────────────────────────────────────────────── */}
      {activeTab === 'mentor' && (
        <div style={{ maxWidth: 680 }}>
          <div style={S.card}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Brain size={12} />YOUR AI CODING MENTOR
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[
                'What should I solve today?',
                `Am I ready for ${company}?`,
                'How to improve my DP skills?',
                'What contest should I join?',
                'Explain my weak areas',
              ].map(q => (
                <button key={q} onClick={() => setMentorQ(q)}
                  style={{ fontSize: '0.74rem', padding: '5px 11px', borderRadius: 7, cursor: 'pointer', fontWeight: 600,
                    background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--accent-purple)' }}>
                  {q}
                </button>
              ))}
            </div>

            <textarea placeholder="Ask your coding mentor anything…"
              value={mentorQ} onChange={e => setMentorQ(e.target.value)}
              rows={3} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />

            <button onClick={askMentor} disabled={mentorLoading || !mentorQ.trim()}
              style={{ ...S.primaryBtn, marginTop: 10, opacity: (mentorLoading || !mentorQ.trim()) ? 0.5 : 1 }}>
              {mentorLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Thinking…</> : <><Brain size={14} />Ask Mentor</>}
            </button>
          </div>

          {mentorError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, marginTop: 14 }}>
              <AlertCircle size={14} /> {mentorError}
            </div>
          )}

          {mentorReply && !mentorLoading && (
            <div style={{ ...S.card, marginTop: 14, borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.04)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 8 }}>MENTOR SAYS</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {mentorReply}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        select option { background: var(--bg-secondary); color: var(--text-primary); }
        input:focus, textarea:focus, select:focus { border-color: var(--accent-purple) !important; }
      `}</style>
    </div>
  );
};

export default CodingTracker;