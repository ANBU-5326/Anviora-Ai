import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studyService } from '../../services/studyService';
import { skillService } from '../../services/skillService';
import { codingService } from '../../services/codingService';
import { userService } from '../../services/userService';
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Mic, 
  Calendar, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Award
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState(null);
  const [skillsCount, setSkillsCount] = useState(0);
  const [codingStreak, setCodingStreak] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [stats, setStats] = useState(null);
  const [aiInsight, setAiInsight] = useState('');

  // Daily checklist/tasks state
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, text: 'Review React Component architecture notes', completed: true, xp: 50 },
    { id: 2, text: 'Complete 2 algorithmic problems (HashMaps)', completed: false, xp: 80 },
    { id: 3, text: 'Fix ATS Resume feedback recommendations', completed: false, xp: 40 },
  ]);

  useEffect(() => {
    // Format date nicely
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    const loadHomeData = async () => {
      try {
        const [plans, skillsData, codingData, dashboardStats] = await Promise.all([
          studyService.getPlans(),
          skillService.getSkills(),
          codingService.getStats(),
          userService.getDashboardStats()
        ]);
        
        setStats(dashboardStats);
        setSkillsCount(skillsData.length);
        setCodingStreak(codingData.streak || dashboardStats.coding_streak || 0);

        if (plans.length > 0) {
          setStudyPlan(plans[0]); // Get active plan
          const activeTasks = [];
          plans[0].tasks.forEach(t => {
            if (activeTasks.length < 3) {
              activeTasks.push({
                id: t.id,
                text: t.text,
                completed: t.completed,
                xp: 50,
                planId: plans[0].id
              });
            }
          });
          if (activeTasks.length > 0) {
            setTodayTasks(activeTasks);
          }
        }

        // Generate a dynamic AI insight from real skill gaps
        const weakSkill = (skillsData || []).find(s => s.score < 60);
        if (weakSkill) {
          setAiInsight(`Based on your profile scan, improving your ${weakSkill.subject} score will significantly boost your readiness for target ${user?.role || 'Software Developer'} roles.`);
        } else {
          setAiInsight("Your skills are well aligned with your target roles. Keep practicing to retain your edge!");
        }
      } catch (err) {
        console.error("Error loading home page details", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  const toggleTask = async (id) => {
    const task = todayTasks.find(t => t.id === id);
    if (task && task.planId) {
      try {
        await studyService.toggleTask(task.planId, id);
      } catch (e) {
        console.error("Failed to toggle study task on backend", e);
      }
    }
    setTodayTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <span>Retrieving your learning space...</span>
      </div>
    );
  }

  // Calculate completed task count
  const completedCount = todayTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / todayTasks.length) * 100);

  return (
    <div className="auth-home-container fade-in">
      {/* Welcome Banner */}
      <section className="welcome-banner-card">
        <div className="welcome-left">
          <span className="welcome-date">{currentDate}</span>
          <h1 className="welcome-title">
            Welcome back, {user?.name || 'Developer'}! <Sparkles className="inline-sparkle" size={24} />
          </h1>
          <p className="welcome-subtitle">
            You're currently preparing for a role in <strong>{user?.role || 'Software Engineering'}</strong>. Ready to advance your milestones today?
          </p>
          <div className="streak-badge">
            <Award size={16} /> <span>{codingStreak} Day Coding Streak</span>
          </div>
        </div>
        <div className="welcome-right-art">
          <div className="floating-sphere"></div>
        </div>
      </section>

      {/* Stats Overview Row */}
      <div className="stats-overview-row">
        <div className="stat-overview-card">
          <div className="stat-icon-bg purple">
            <Sparkles size={16} />
          </div>
          <div className="stat-info-group">
            <span className="stat-label">Daily XP</span>
            <span className="stat-value">240 XP</span>
            <span className="stat-change positive">+15% from yesterday</span>
          </div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon-bg orange">
            <Award size={16} />
          </div>
          <div className="stat-info-group">
            <span className="stat-label">Coding Streak</span>
            <span className="stat-value">{codingStreak} Days</span>
            <span className="stat-change neutral">Keep it up!</span>
          </div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon-bg blue">
            <TrendingUp size={16} />
          </div>
          <div className="stat-info-group">
            <span className="stat-label">Avg. ATS Match</span>
            <span className="stat-value">{stats ? `${stats.resume_score}%` : '78%'}</span>
            <span className="stat-change positive">{stats && stats.resume_score > 0 ? 'Latest resume ATS scan' : 'No resume uploaded yet'}</span>
          </div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon-bg pink">
            <Clock size={16} />
          </div>
          <div className="stat-info-group">
            <span className="stat-label">Mock Interviews</span>
            <span className="stat-value">{stats ? `${stats.readiness_interview}%` : '54%'} Readiness</span>
            <span className="stat-change positive">Interview readiness score</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards & Quick Tools */}
      <div className="auth-home-grid">
        {/* Left Column: Progress & Daily Planner */}
        <div className="home-content-left">
          {/* Active Study Track Progress */}
          {studyPlan && (
            <div className="home-glass-card study-track-summary">
              <h2 className="card-header-title">
                <BookOpen size={20} /> Active Learning Track
              </h2>
              <div className="track-details">
                <h3 className="track-name">{studyPlan.title}</h3>
                <span className="track-provider">Anviora Certified Track</span>
              </div>
              <div className="progress-section">
                <div className="progress-bar-labels">
                  <span>Track Completion</span>
                  <span className="progress-value">{studyPlan.progress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${studyPlan.progress}%` }}></div>
                </div>
              </div>
              <button className="resume-track-btn" onClick={() => navigate('/study')}>
                Resume Learning <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Weekly XP Progress Card */}
          <div className="home-glass-card weekly-activity-card">
            <h2 className="card-header-title">
              <TrendingUp size={20} /> Weekly XP Progress
            </h2>
            <div className="weekly-chart">
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '40%' }}></div>
                <span className="chart-day">Mon</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '65%' }}></div>
                <span className="chart-day">Tue</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill active" style={{ height: '85%' }}></div>
                <span className="chart-day active">Wed</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '0%' }}></div>
                <span className="chart-day">Thu</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '0%' }}></div>
                <span className="chart-day">Fri</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '0%' }}></div>
                <span className="chart-day">Sat</span>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar-fill" style={{ height: '0%' }}></div>
                <span className="chart-day">Sun</span>
              </div>
            </div>
            <div className="chart-footer">
              <span>Weekly Average: <strong>120 XP / day</strong></span>
              <span className="weekly-total">Total: <strong>360 XP</strong></span>
            </div>
          </div>

          {/* Today's Checklist */}
          <div className="home-glass-card daily-checklist-card">
            <div className="checklist-header">
              <h2 className="card-header-title">
                <Calendar size={20} /> Today's Checklist
              </h2>
              <span className="checklist-stats">{progressPercent}% done</span>
            </div>
            <div className="checklist-todo-list">
              {todayTasks.map(task => (
                <div key={task.id} className={`checklist-item ${task.completed ? 'completed' : ''}`}>
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="checkbox-checkmark"></span>
                    <span className="task-text">{task.text}</span>
                  </label>
                  <span className="task-xp">+{task.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Launch Actions & AI Insight */}
        <div className="home-content-right">
          {/* Quick Tools Launch Grid */}
          <div className="tools-launch-container">
            <h2 className="card-header-title" style={{ marginBottom: '16px' }}>
              <Clock size={20} /> Quick Accelerators
            </h2>
            <div className="tools-grid-layout">
              <Link to="/mentor" className="tool-shortcut-card">
                <div className="shortcut-icon-wrapper purple">
                  <MessageSquare size={20} />
                </div>
                <div className="shortcut-info">
                  <span className="shortcut-name">AI Mentor</span>
                  <span className="shortcut-desc">Chat with helper</span>
                </div>
              </Link>

              <Link to="/skills" className="tool-shortcut-card">
                <div className="shortcut-icon-wrapper blue">
                  <TrendingUp size={20} />
                </div>
                <div className="shortcut-info">
                  <span className="shortcut-name">Skill Analyzer</span>
                  <span className="shortcut-desc">Assess skills</span>
                </div>
              </Link>

              <Link to="/resume" className="tool-shortcut-card">
                <div className="shortcut-icon-wrapper cyan">
                  <FileText size={20} />
                </div>
                <div className="shortcut-info">
                  <span className="shortcut-name">Resume ATS</span>
                  <span className="shortcut-desc">Match keywords</span>
                </div>
              </Link>

              <Link to="/interview" className="tool-shortcut-card">
                <div className="shortcut-icon-wrapper pink">
                  <Mic size={20} />
                </div>
                <div className="shortcut-info">
                  <span className="shortcut-name">Vocal Coach</span>
                  <span className="shortcut-desc">Practice speech</span>
                </div>
              </Link>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="home-glass-card ai-insight-card">
            <div className="insight-header">
              <div className="insight-badge">
                <Sparkles size={14} /> AI Recommendation
              </div>
            </div>
            <p className="insight-text">
              "{aiInsight}"
            </p>
            <div className="insight-action">
              <Link to="/skills" className="insight-link">
                Analyze Skills Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Upcoming Milestones Timeline */}
          <div className="home-glass-card upcoming-milestones-card">
            <h2 className="card-header-title">
              <Clock size={20} /> Upcoming Milestones
            </h2>
            <div className="milestones-timeline">
              <div className="timeline-item active">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-time">Today, 2:00 PM</span>
                  <span className="timeline-title">Complete React Hooks quiz</span>
                  <span className="timeline-desc">Prepare for Frontend Master track</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-time">Tomorrow, 10:00 AM</span>
                  <span className="timeline-title">Mock Interview with Coach</span>
                  <span className="timeline-desc">Behavioral prep with real-time feedback</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-time">Friday, June 12</span>
                  <span className="timeline-title">ATS Resume Rescan</span>
                  <span className="timeline-desc">Aiming for 90%+ keyword match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
