import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Award, Target, Zap, BookOpen, Code2, Briefcase, TrendingUp,
  Star, AlertCircle, CheckCircle2, ArrowRight, Brain, Rocket, X, RefreshCw, Check, AlertTriangle, Play, Mic, FileText, GitBranch,
  Shield, Terminal, Lock, BarChart3, Cloud, Box
} from 'lucide-react';
import { skillService } from '../../services/skillService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CAREER_MODULES_MAP = {
  'AI Engineer': [
    { cat: 'programming', label: 'Python & Algorithm Logic', icon: Code2, color: '#7C3AED' },
    { cat: 'ai', label: 'Machine Learning & PyTorch', icon: Brain, color: '#3b82f6' },
    { cat: 'ai', label: 'LLMs & RAG Architectures', icon: Brain, color: '#8b5cf6' },
    { cat: 'database', label: 'SQL & Data Pipelines', icon: BookOpen, color: '#10b981' },
    { cat: 'mathematics', label: 'Mathematics & Calculus', icon: TrendingUp, color: '#d97706' },
    { cat: 'projects', label: 'AI Portfolio & GitHub', icon: GitBranch, color: '#ec4899' },
    { cat: 'softskills', label: 'Leadership & Soft Skills', icon: Zap, color: '#06b6d4' }
  ],
  'Full Stack Developer': [
    { cat: 'programming', label: 'JavaScript & TypeScript', icon: Code2, color: '#f59e0b' },
    { cat: 'programming', label: 'React & UI Architecture', icon: Code2, color: '#3b82f6' },
    { cat: 'programming', label: 'Node.js / Python Backend', icon: Code2, color: '#10b981' },
    { cat: 'database', label: 'SQL & NoSQL Databases', icon: BookOpen, color: '#10b981' },
    { cat: 'projects', label: 'Full Stack Portfolio', icon: GitBranch, color: '#ec4899' },
    { cat: 'communication', label: 'REST APIs & System Design', icon: Mic, color: '#8b5cf6' },
    { cat: 'softskills', label: 'Agile & Team Leadership', icon: Zap, color: '#06b6d4' }
  ],
  'Cyber Security Analyst': [
    { cat: 'programming', label: 'Network Security & Firewalls', icon: Shield, color: '#ef4444' },
    { cat: 'programming', label: 'Ethical Hacking & PenTesting', icon: Terminal, color: '#ef4444' },
    { cat: 'programming', label: 'Linux Admin & Bash', icon: Code2, color: '#6366f1' },
    { cat: 'programming', label: 'Cryptography & Audit', icon: Lock, color: '#f59e0b' },
    { cat: 'database', label: 'SIEM & Log Monitoring', icon: BookOpen, color: '#10b981' },
    { cat: 'projects', label: 'Security Audit Portfolio', icon: GitBranch, color: '#ec4899' },
    { cat: 'softskills', label: 'Incident Mgmt & Leadership', icon: Zap, color: '#06b6d4' }
  ],
  'Data Scientist': [
    { cat: 'programming', label: 'Python & Pandas/NumPy', icon: Code2, color: '#7C3AED' },
    { cat: 'database', label: 'SQL & Data Warehousing', icon: BookOpen, color: '#10b981' },
    { cat: 'mathematics', label: 'Statistics & Hypothesis', icon: TrendingUp, color: '#d97706' },
    { cat: 'ai', label: 'Machine Learning Models', icon: Brain, color: '#3b82f6' },
    { cat: 'projects', label: 'Data Science Portfolio', icon: GitBranch, color: '#ec4899' },
    { cat: 'communication', label: 'Data Viz & BI Dashboards', icon: BarChart3, color: '#8b5cf6' },
    { cat: 'softskills', label: 'Business Insights & Soft Skills', icon: Zap, color: '#06b6d4' }
  ],
  'DevOps & Cloud Engineer': [
    { cat: 'projects', label: 'AWS & Cloud Infrastructure', icon: Cloud, color: '#3b82f6' },
    { cat: 'projects', label: 'Docker & Kubernetes', icon: Box, color: '#06b6d4' },
    { cat: 'projects', label: 'CI/CD Pipelines & Automation', icon: GitBranch, color: '#10b981' },
    { cat: 'programming', label: 'Linux Admin & Automation', icon: Terminal, color: '#6366f1' },
    { cat: 'database', label: 'Terraform & Infrastructure', icon: BookOpen, color: '#7C3AED' },
    { cat: 'communication', label: 'System Design & Ops', icon: Mic, color: '#8b5cf6' },
    { cat: 'softskills', label: 'Cloud Ops & Leadership', icon: Zap, color: '#06b6d4' }
  ]
};

const FALLBACK_CAREERS = [
  { id: 1, title: 'AI Engineer', category: 'Artificial Intelligence' },
  { id: 2, title: 'Full Stack Developer', category: 'Software Engineering' },
  { id: 3, title: 'Cyber Security Analyst', category: 'Cybersecurity' },
  { id: 4, title: 'Data Scientist', category: 'Data & Analytics' },
  { id: 5, title: 'DevOps & Cloud Engineer', category: 'Cloud & Operations' }
];

const DEFAULT_CATEGORY_SCORES = [
  { subject: 'Programming', A: 50, fullMark: 100 },
  { subject: 'AI Knowledge', A: 40, fullMark: 100 },
  { subject: 'Database', A: 45, fullMark: 100 },
  { subject: 'Mathematics', A: 40, fullMark: 100 },
  { subject: 'Projects', A: 50, fullMark: 100 },
  { subject: 'Resume ATS', A: 45, fullMark: 100 },
  { subject: 'GitHub Activity', A: 40, fullMark: 100 },
  { subject: 'Communication', A: 50, fullMark: 100 },
  { subject: 'Soft Skills', A: 55, fullMark: 100 },
];

export default function SkillAnalyzer() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'assessment'

  // 360 Profile Data
  const [profile360, setProfile360] = useState(null);
  const [careersList, setCareersList] = useState(FALLBACK_CAREERS);
  const [selectedCareerId, setSelectedCareerId] = useState(1);

  // Category Assessment Test Modal
  const [activeTestCategory, setActiveTestCategory] = useState(null);
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testFormInput, setTestFormInput] = useState({});
  const [testResult, setTestResult] = useState(null);

  // Load 360 Profile & Careers
  const load360Data = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setErrorMessage(null);

      const [profResult, carResult] = await Promise.allSettled([
        skillService.fetch360Profile(),
        skillService.fetchTargetCareers()
      ]);

      let profData = null;
      let carData = FALLBACK_CAREERS;

      if (carResult.status === 'fulfilled' && Array.isArray(carResult.value) && carResult.value.length > 0) {
        carData = carResult.value;
      }

      if (profResult.status === 'fulfilled' && profResult.value) {
        profData = profResult.value;
      } else if (profResult.reason) {
        console.warn('Notice loading 360 profile:', profResult.reason);
        const detail = profResult.reason?.message || 'Cloud sync unavailable. Displaying local skill profile.';
        if (!detail.includes('401') && !detail.includes('expired')) {
          setErrorMessage(detail);
        }
      }

      setProfile360(profData);
      setCareersList(carData);

      if (profData?.target_career?.id) {
        setSelectedCareerId(profData.target_career.id);
      } else if (carData.length > 0) {
        setSelectedCareerId(carData[0].id);
      }
    } catch (e) {
      console.error('Error loading 360 skill profile:', e);
      setCareersList(FALLBACK_CAREERS);
      setErrorMessage('Backend connection error. Please verify server status.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load360Data(true);
  }, [load360Data]);

  // Handle Career Selection
  const handleCareerChange = async (e) => {
    const careerId = parseInt(e.target.value);
    setSelectedCareerId(careerId);
    try {
      await skillService.selectTargetCareer(careerId);
      await load360Data(false);
    } catch (err) {
      console.error('Failed to update target career:', err);
    }
  };

  // Open Category Assessment Modal with Controlled Initial Defaults
  const openCategoryModal = (cat) => {
    setActiveTestCategory(cat);
    setTestResult(null);
    if (cat === 'programming') {
      setTestFormInput({
        mcq_score: 16,
        code: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1"
      });
    } else if (cat === 'projects') {
      setTestFormInput({
        repo_url: "https://github.com/user/ai-platform",
        tech_stack: "React, FastAPI, PyTorch, Docker"
      });
    } else if (cat === 'communication') {
      setTestFormInput({
        transcript: "I am a software engineer with expertise in building full stack applications and fine-tuning machine learning models for production."
      });
    } else if (cat === 'softskills') {
      setTestFormInput({
        answers: ["When a teammate misses a deadline, I first check in to understand any blockers, offer technical assistance, and re-align our sprint milestones."]
      });
    } else {
      setTestFormInput({ mcq_score: 8 });
    }
  };

  const [rescanning, setRescanning] = useState(false);

  const handleLiveRescan = async () => {
    try {
      setRescanning(true);
      await skillService.rescan360Profile();
      await load360Data(false);
    } catch (err) {
      console.error('Failed live rescan:', err);
    } finally {
      setRescanning(false);
    }
  };

  // Optimistic Complete Roadmap Task
  const handleTaskComplete = async (taskId) => {
    try {
      if (profile360) {
        setProfile360(prev => ({
          ...prev,
          overall_score: Math.min(100, (prev?.overall_score || 50) + 3),
          learning_roadmap: (prev?.learning_roadmap || []).map(r => r.id === taskId ? { ...r, is_completed: true } : r)
        }));
      }
      await skillService.completeRoadmapTask(taskId);
      await load360Data(false);
    } catch (err) {
      console.error('Failed to complete roadmap task:', err);
    }
  };

  // Submit Category Assessment with Real-time AI Feedback
  const handleCategorySubmit = async () => {
    if (!activeTestCategory) return;
    try {
      setTestSubmitting(true);
      const payload = {
        category: activeTestCategory,
        ...testFormInput
      };
      const res = await skillService.assessCategory360(payload);
      setTestResult(res);
      await load360Data(false);
    } catch (err) {
      console.error('Failed to submit category assessment:', err);
    } finally {
      setTestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: 16 }}>
        <LoadingSpinner size="lg" />
        <span style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.95rem', fontWeight: 600 }}>Loading 360° Career & Skill Engine...</span>
      </div>
    );
  }

  const radarData = (profile360?.category_scores && profile360.category_scores.length > 0)
    ? profile360.category_scores
    : DEFAULT_CATEGORY_SCORES;
  const skillGaps = profile360?.skill_gaps || [];
  const roadmap = profile360?.learning_roadmap || [];
  const progressHistory = profile360?.progress_history || [];
  const targetTitle = profile360?.target_career?.title || (careersList.find(c => c.id === selectedCareerId)?.title) || 'AI Engineer';

  return (
    <div style={{ padding: '24px 32px', minHeight: '90vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Optional Dismissible Sync Warning Banner */}
      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{errorMessage}</span>
          </div>
          <button onClick={() => load360Data(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Retry Sync
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Award size={18} style={{ color: '#7C3AED' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary, #475569)' }}>AI Skill Assessment Engine</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            360° Skill Analyzer & Career Roadmap
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleLiveRescan}
            disabled={rescanning}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#7C3AED', color: '#ffffff',
              padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.85rem',
              cursor: rescanning ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} style={{ animation: rescanning ? 'spin 1s linear infinite' : 'none' }} />
            {rescanning ? 'Scanning Real-Time AI...' : 'Real-Time Live AI Rescan'}
          </button>

          {/* Career Target Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Target size={18} style={{ color: '#7C3AED' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Career Benchmark</span>
              <select
                value={selectedCareerId}
                onChange={handleCareerChange}
                style={{ background: 'transparent', border: 'none', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', outline: 'none' }}
              >
                {careersList.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Stats Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124,58,237,0.08)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7C3AED' }}>{profile360?.overall_score ?? 48} / 100</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Overall 360° Readiness</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444' }}>{skillGaps.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Detected Skill Gaps</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>
              {roadmap.filter(r => r.is_completed).length} / {roadmap.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Roadmap Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Multi-Category Assessment Launchers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
        
        {/* Radar Chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>360° Skill Capability Radar</h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(124,58,237,0.08)', color: '#7C3AED', padding: '4px 10px', borderRadius: 40, fontWeight: 700 }}>
              Benchmarked vs {targetTitle}
            </span>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Student Capability" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Category Assessment Test Launchpad (Dynamic based on selected Target Career) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Assessment Modules for {activeCareer?.title || 'Selected Benchmark'}</h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(124,58,237,0.08)', color: '#7C3AED', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>
              Adapted for {activeCareer?.title || 'Target'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
            Select a benchmark category below to test your skills tailored specifically for <strong>{activeCareer?.title}</strong>:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, flex: 1, alignContent: 'start' }}>
            {(CAREER_MODULES_MAP[activeCareer?.title] || CAREER_MODULES_MAP['AI Engineer']).map(m => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => openCategoryModal(m.cat, m.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 12, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
                    minWidth: 0, minHeight: 68, boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = m.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${m.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComp size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25, wordBreak: 'normal', whiteSpace: 'normal' }}>{m.label}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2, fontWeight: 600 }}>Start Test →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Growth Area Chart */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} /> Real-Time Skill Readiness Growth & History
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.08)', color: '#10b981', padding: '4px 10px', borderRadius: 40, fontWeight: 700 }}>
            Live AI Tracked
          </span>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressHistory.length > 0 ? progressHistory : [
              { recorded_at: 'Initial', recorded_score: 40 },
              { recorded_at: 'Assessment', recorded_score: profile360?.overall_score ?? 48 },
              { recorded_at: 'Current Live', recorded_score: profile360?.overall_score ?? 48 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="recorded_at" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="recorded_score" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Gap Analysis & Learning Roadmap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        
        {/* Detected Gaps */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} /> Skill Gap Analysis ({profile360?.target_career?.title})
          </h3>
          
          {skillGaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#10b981', fontWeight: 600 }}>
              <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
              <p>Awesome! Your current skills match or exceed all target benchmarks for this career.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 320, overflowY: 'auto' }}>
              {skillGaps.map(g => (
                <div key={g.skill_name} style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#0f172a' }}>{g.skill_name}</span>
                    <span style={{ color: '#ef4444' }}>Gap: -{g.gap} points (Actual: {g.actual_level} / Required: {g.required_level})</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${(g.actual_level / g.required_level) * 100}%`, height: '100%', background: '#7C3AED', borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Learning Roadmap */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={18} style={{ color: '#7C3AED' }} /> Personalized AI Learning Roadmap
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
            {roadmap.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: item.is_completed ? 'rgba(16,185,129,0.06)' : '#f8fafc', padding: '12px 16px', borderRadius: 10, border: item.is_completed ? '1px solid #10b981' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => !item.is_completed && handleTaskComplete(item.id)}
                    disabled={item.is_completed}
                    style={{ background: 'none', border: 'none', cursor: item.is_completed ? 'default' : 'pointer', color: item.is_completed ? '#10b981' : '#94a3b8' }}
                  >
                    {item.is_completed ? <CheckCircle2 size={20} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.is_completed ? '#059669' : '#0f172a', textDecoration: item.is_completed ? 'line-through' : 'none' }}>{item.action_title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Skill: {item.skill_name} • Est. Time: {item.estimated_hours}h</span>
                  </div>
                </div>

                {!item.is_completed && (
                  <button onClick={() => handleTaskComplete(item.id)} style={{ padding: '6px 12px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Test Modal */}
      {activeTestCategory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', width: '90%', maxWidth: 540, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textTransform: 'capitalize', color: '#0f172a' }}>
                {activeTestCategory} Assessment Test
              </h3>
              <button onClick={() => setActiveTestCategory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {testResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center', background: 'rgba(124,58,237,0.06)', padding: 20, borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#7C3AED' }}>{testResult.score_achieved} / 100</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Category Assessment Score</p>
                </div>
                {testResult.details && (
                  <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.75rem', color: '#334155', overflowX: 'auto', margin: 0 }}>
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
                <button onClick={() => setActiveTestCategory(null)} style={{ padding: 12, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                  Close & View Updated Profile
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTestCategory === 'programming' && (
                  <>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>MCQ Correct Answers (out of 20):</label>
                    <input type="number" max="20" min="0" value={testFormInput.mcq_score ?? 16} onChange={e => setTestFormInput({ ...testFormInput, mcq_score: parseInt(e.target.value) || 0 })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Your Python Code Submission:</label>
                    <textarea rows="4" value={testFormInput.code ?? ''} onChange={e => setTestFormInput({ ...testFormInput, code: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontFamily: 'monospace' }} />
                  </>
                )}

                {activeTestCategory === 'projects' && (
                  <>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>GitHub Repository URL:</label>
                    <input type="text" value={testFormInput.repo_url ?? ''} onChange={e => setTestFormInput({ ...testFormInput, repo_url: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Tech Stack & Description:</label>
                    <input type="text" value={testFormInput.tech_stack ?? ''} onChange={e => setTestFormInput({ ...testFormInput, tech_stack: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </>
                )}

                {activeTestCategory === 'communication' && (
                  <>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Spoken Response Transcript:</label>
                    <textarea rows="4" value={testFormInput.transcript ?? ''} onChange={e => setTestFormInput({ ...testFormInput, transcript: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </>
                )}

                {(activeTestCategory === 'ai' || activeTestCategory === 'database' || activeTestCategory === 'mathematics') && (
                  <>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Category MCQ Score (out of 10):</label>
                    <input type="number" max="10" min="0" value={testFormInput.mcq_score ?? 8} onChange={e => setTestFormInput({ ...testFormInput, mcq_score: parseInt(e.target.value) || 0 })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </>
                )}

                {activeTestCategory === 'softskills' && (
                  <>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Situational Judgment Scenario Response:</label>
                    <textarea rows="4" value={testFormInput.answers?.[0] ?? ''} onChange={e => setTestFormInput({ ...testFormInput, answers: [e.target.value] })} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </>
                )}

                <button onClick={handleCategorySubmit} disabled={testSubmitting} style={{ padding: 12, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {testSubmitting ? <LoadingSpinner size="sm" /> : <Play size={16} />} Evaluate with AI Engine
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
