import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  GraduationCap, 
  Search, 
  ChevronDown, 
  ArrowRight, 
  Star, 
  Check, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Award, 
  TrendingUp, 
  FileText, 
  Mic, 
  Play, 
  Users, 
  Code,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Activity,
  Briefcase,
  Layers,
  UploadCloud,
  ChevronRight,
  Info,
  X,
  Bell,
  Menu
} from 'lucide-react';
import './Landing.css';

// Course data list
const coursesData = [
  {
    id: 1,
    category: 'ds',
    title: 'AI Study Planner',
    provider: 'Anviora',
    level: 'Personalized',
    duration: 'Daily',
    hoursPerWeek: 'Adaptive',
    rating: 4.9,
    reviews: 12500,
    badge: 'Core Feature',
    skills: ['Milestone Tracking', 'Daily Goals', 'XP Points', 'Adaptive Learning'],
    themeGradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    category: 'ds',
    title: 'Visual Skill Analyzer',
    provider: 'Anviora',
    level: 'Advanced',
    duration: 'Real-time',
    hoursPerWeek: 'Interactive',
    rating: 4.8,
    reviews: 8400,
    badge: 'Core Feature',
    skills: ['Skill Graph', 'Gap Analysis', 'Tech Stack Assessment', 'Career Mapping'],
    themeGradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    category: 'ds',
    title: 'ATS Resume Matcher',
    provider: 'Anviora',
    level: 'Professional',
    duration: 'Instant',
    hoursPerWeek: 'Automated',
    rating: 4.9,
    reviews: 15200,
    badge: 'Core Feature',
    skills: ['Keyword Optimization', 'Format Checking', 'Score Prediction', 'ATS Alignment'],
    themeGradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    category: 'ds',
    title: 'AI Vocal Interview Coach',
    provider: 'Anviora',
    level: 'Interactive',
    duration: 'Unlimited',
    hoursPerWeek: 'Live Sessions',
    rating: 4.7,
    reviews: 9300,
    badge: 'Core Feature',
    skills: ['Speech Analysis', 'Mock Interviews', 'Real-time Feedback', 'Confidence Building'],
    themeGradient: 'linear-gradient(135deg, #6441a5, #2a0845)',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    category: 'ai',
    title: 'AI Coding Mentor',
    provider: 'Anviora',
    level: 'Expert',
    duration: '24/7',
    hoursPerWeek: 'On-Demand',
    rating: 4.9,
    reviews: 21000,
    badge: 'Ecosystem',
    skills: ['Code Review', 'Debugging', 'Architecture Advice', 'Pair Programming'],
    themeGradient: 'linear-gradient(135deg, #f953c6, #b91d73)',
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    category: 'cs',
    title: 'Career Growth Engine',
    provider: 'Anviora',
    level: 'Career',
    duration: 'Continuous',
    hoursPerWeek: 'Targeted',
    rating: 4.8,
    reviews: 14500,
    badge: 'Success',
    skills: ['Job Matching', 'Application Tracking', 'Salary Negotiation Prep', 'Networking'],
    themeGradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    category: 'ai',
    title: 'Global Developer Hub',
    provider: 'Anviora',
    level: 'Community',
    duration: '24/7',
    hoursPerWeek: 'Collaborative',
    rating: 4.7,
    reviews: 18800,
    badge: 'Network',
    skills: ['Peer Reviews', 'Open Source', 'Hackathons', 'Knowledge Sharing'],
    themeGradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    category: 'biz',
    title: 'Portfolio Builder',
    provider: 'Anviora',
    level: 'Showcase',
    duration: 'Ongoing',
    hoursPerWeek: 'Dynamic',
    rating: 4.6,
    reviews: 6200,
    badge: 'Showcase',
    skills: ['GitHub Integration', 'Live Demos', 'Architecture Diagrams', 'Project Hosting'],
    themeGradient: 'linear-gradient(135deg, #134e5e, #71b280)',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
  }
];

// Animated counter hook
const useCountUp = (target, duration = 2000, suffix = '') => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
};

// StatsSection with animated counters
const StatsSection = () => {
  const learners = useCountUp(150000, 2200);
  const placement = useCountUp(89, 1800);
  const partners = useCountUp(200, 2000);
  const rating = useCountUp(485, 1900); // represents 4.85 x100

  return (
    <section className="stats-section">
      <div className="stats-bg-blur" />
      <div className="stats-grid">
        <div className="stat-item" ref={learners.ref}>
          <span className="stat-num stat-num--animate">
            {learners.count.toLocaleString()}<span className="stat-suffix">+</span>
          </span>
          <span className="stat-label">Active Learners Worldwide</span>
        </div>
        <div className="stat-item" ref={placement.ref}>
          <span className="stat-num stat-num--animate">
            {placement.count}<span className="stat-suffix">%</span>
          </span>
          <span className="stat-label">Reported Placement or Career Growth</span>
        </div>
        <div className="stat-item" ref={partners.ref}>
          <span className="stat-num stat-num--animate">
            {partners.count}<span className="stat-suffix">+</span>
          </span>
          <span className="stat-label">Global Partner Institutions</span>
        </div>
        <div className="stat-item" ref={rating.ref}>
          <span className="stat-num stat-num--animate">
            {(rating.count / 100).toFixed(2)}<span className="stat-suffix"> / 5</span>
          </span>
          <span className="stat-label">Average Curriculum Rating</span>
        </div>
      </div>
    </section>
  );
};

const Landing = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // State variables
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePreview, setActivePreview] = useState('study');
  const [enrollModal, setEnrollModal] = useState(null);
  const [aiEcosystemOpen, setAiEcosystemOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  // Study Planner states
  const [studyTodos, setStudyTodos] = useState([
    { id: 1, text: 'Review React Component architecture notes', checked: true, xp: 50 },
    { id: 2, text: 'Complete 2 algorithmic problems (HashMaps)', checked: true, xp: 80 },
    { id: 3, text: 'Fix ATS Resume feedback recommendations', checked: true, xp: 40 },
    { id: 4, text: 'Practice System Design interview simulation', checked: false, xp: 100 }
  ]);
  const [xpPoints, setXpPoints] = useState(170); // starts with 170/270

  // Skill Analyzer states
  const [activeSkillProfile, setActiveSkillProfile] = useState('web');

  // Resume Scanner states
  const [scanState, setScanState] = useState('idle'); // idle, scanning, completed
  const [scanScore, setScanScore] = useState(0);
  
  // Interview Coach states
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachStep, setCoachStep] = useState(0); // 0: setup, 1: streaming/recording, 2: feedback

  // Handle study planner check/uncheck
  const toggleTodo = (id) => {
    setStudyTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const nextState = !todo.checked;
        setXpPoints(pts => nextState ? pts + todo.xp : pts - todo.xp);
        return { ...todo, checked: nextState };
      }
      return todo;
    }));
  };

  // Run ATS simulation
  const startAtsScan = () => {
    setScanState('scanning');
    setScanScore(0);
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += 4;
      if (currentScore >= 88) {
        clearInterval(interval);
        setScanScore(88);
        setScanState('completed');
      } else {
        setScanScore(currentScore);
      }
    }, 80);
  };

  // Run Interview simulation
  const triggerInterviewMock = () => {
    setIsCoaching(true);
    setCoachStep(1);
    
    // Simulate progression from speech to live review
    setTimeout(() => {
      setCoachStep(2);
    }, 4500);
  };

  // Reset interview simulator
  const resetInterviewMock = () => {
    setIsCoaching(false);
    setCoachStep(0);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-left-group">
          <Link to="/" className="brand-section">
            <div className="brand-logo">A</div>
            <span className="brand-name">Anviora</span>
          </Link>

          {/* Explore Dropdown */}
          <div className="explore-container">
            <button
              className="explore-btn"
              onClick={() => {
                setExploreOpen(!exploreOpen);
                setAiEcosystemOpen(false);
                setResourcesOpen(false);
              }}
              aria-expanded={exploreOpen}
            >
              Explore <ChevronDown size={16} style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {exploreOpen && (
              <div className="explore-dropdown">
                <button className="explore-item" onClick={() => { setActiveCategory('all'); setExploreOpen(false); }}>
                  <Layers size={16} /> All Catalog
                </button>
                <button className="explore-item" onClick={() => { setActiveCategory('cs'); setExploreOpen(false); }}>
                  <Code size={16} /> Computer Science
                </button>
                <button className="explore-item" onClick={() => { setActiveCategory('ds'); setExploreOpen(false); }}>
                  <TrendingUp size={16} /> Data Science
                </button>
                <button className="explore-item" onClick={() => { setActiveCategory('ai'); setExploreOpen(false); }}>
                  <Cpu size={16} /> Artificial Intelligence
                </button>
                <button className="explore-item" onClick={() => { setActiveCategory('biz'); setExploreOpen(false); }}>
                  <Award size={16} /> Business & Communication
                </button>
              </div>
            )}
          </div>

          {/* AI Ecosystem Dropdown */}
          <div className="explore-container">
            <button
              className="explore-btn secondary-nav-btn"
              onClick={() => {
                setAiEcosystemOpen(!aiEcosystemOpen);
                setExploreOpen(false);
                setResourcesOpen(false);
              }}
              aria-expanded={aiEcosystemOpen}
            >
              AI Ecosystem <ChevronDown size={16} style={{ transform: aiEcosystemOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {aiEcosystemOpen && (
              <div className="explore-dropdown ecosystem-dropdown">
                <Link to="/study" className="explore-item" onClick={() => setAiEcosystemOpen(false)}>
                  <Calendar size={16} style={{ color: 'var(--accent-purple)' }} />
                  <div>
                    <div className="explore-item-title">Study Planner</div>
                    <div className="explore-item-desc">Adaptive milestones</div>
                  </div>
                </Link>
                <Link to="/skills" className="explore-item" onClick={() => setAiEcosystemOpen(false)}>
                  <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div className="explore-item-title">Skill Analyzer</div>
                    <div className="explore-item-desc">Visual skill tracks</div>
                  </div>
                </Link>
                <Link to="/resume" className="explore-item" onClick={() => setAiEcosystemOpen(false)}>
                  <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
                  <div>
                    <div className="explore-item-title">ATS Matcher</div>
                    <div className="explore-item-desc">Resume alignment checker</div>
                  </div>
                </Link>
                <Link to="/interview" className="explore-item" onClick={() => setAiEcosystemOpen(false)}>
                  <Mic size={16} style={{ color: 'var(--accent-pink)' }} />
                  <div>
                    <div className="explore-item-title">Vocal Interview Coach</div>
                    <div className="explore-item-desc">Real-time voice mocks</div>
                  </div>
                </Link>
                <Link to="/mentor" className="explore-item" onClick={() => setAiEcosystemOpen(false)}>
                  <MessageSquare size={16} style={{ color: 'var(--accent-purple)' }} />
                  <div>
                    <div className="explore-item-title">AI Chat Mentor</div>
                    <div className="explore-item-desc">Expert coding advice</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Global Navbar Search with Suggestions */}
        <div className="header-search-container">
          <div className="header-search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="What do you want to learn today?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>
          {searchFocused && (
            <div className="search-suggestions-panel">
              <span className="suggestion-label">Suggested Topics</span>
              <button className="suggestion-item" onMouseDown={() => { setSearchQuery('Data Analytics'); setSearchFocused(false); }}>
                <Search size={13} /> Data Analytics Certification
              </button>
              <button className="suggestion-item" onMouseDown={() => { setSearchQuery('Python'); setSearchFocused(false); }}>
                <Search size={13} /> Python programming for beginners
              </button>
              <button className="suggestion-item" onMouseDown={() => { setSearchQuery('ATS'); setSearchFocused(false); }}>
                <Search size={13} /> ATS resume scores guide
              </button>
              <button className="suggestion-item" onMouseDown={() => { setSearchQuery('AI Interview'); setSearchFocused(false); }}>
                <Search size={13} /> AI mock verbal questions
              </button>
            </div>
          )}
        </div>

        {/* Theme and Auth Actions */}
        <div className="nav-links">
          {/* Resources Dropdown */}
          <div className="explore-container">
            <button
              className="nav-link-btn"
              onClick={() => {
                setResourcesOpen(!resourcesOpen);
                setExploreOpen(false);
                setAiEcosystemOpen(false);
              }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.925rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
            >
              Resources <ChevronDown size={12} style={{ transform: resourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {resourcesOpen && (
              <div className="explore-dropdown resources-dropdown">
                <a href="#" className="explore-item">Developer Community</a>
                <a href="#" className="explore-item">Academic Insights</a>
                <a href="#" className="explore-item">Platform FAQ & Help</a>
                <a href="#" className="explore-item">Anviora Careers</a>
              </div>
            )}
          </div>

          <Link to="/mentor" className="nav-link">AI Mentor</Link>
          <Link to="/study" className="nav-link">Plan Tracks</Link>
          
          <button className="nav-icon-btn notification-bell" title="Notifications" style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative' }}>
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            <span className="bell-badge">2</span>
          </button>


          
          <div className="nav-auth-actions">
            <Link to="/login" className="sign-in-btn">Sign In</Link>
            <Link to="/login" className="join-btn">Join for Free</Link>
          </div>
        </div>

        {/* Mobile Hamburger toggle */}
        <button 
          className="mobile-hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Toggle Menu"
          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="mobile-drawer-search">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mobile-drawer-links">
              <span className="drawer-section-title">Ecosystem Products</span>
              <Link to="/study" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>AI Study Planner</Link>
              <Link to="/skills" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Skill Analyzer</Link>
              <Link to="/resume" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Resume ATS Matcher</Link>
              <Link to="/interview" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>AI Interview Coach</Link>
              <Link to="/mentor" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>AI Mentor Room</Link>
              
              <span className="drawer-section-title">Resources</span>
              <a href="#" className="drawer-link">Community Hub</a>
              <a href="#" className="drawer-link">Careers</a>
              <a href="#" className="drawer-link">FAQ & Help</a>
              
              <div className="drawer-divider" />
              

              
              <div className="drawer-auth-actions">
                <Link to="/login" className="sign-in-btn drawer-sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/login" className="join-btn drawer-join" onClick={() => setMobileMenuOpen(false)}>Join for Free</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-tag">
            <Sparkles size={14} /> Next-Gen AI Career Ecosystem
          </div>
          <h1 className="hero-title">
            Learn Without Limits.<br />
            Succeed with <span className="gradient-text">Anviora</span>
          </h1>
          <p className="hero-desc">
            Start, switch, or supercharge your professional career. Analyze industry skill gaps, scan resumes for ATS scores, study with smart AI planners, and practice with real-time AI verbal interview coaching.
          </p>

          <div className="hero-ctas">
            <Link to="/login" className="hero-primary-btn">
              Get Started for Free <Sparkles size={16} />
            </Link>
            <Link to="/login" className="hero-secondary-btn">
              Explore Demo Portal
            </Link>
          </div>
        </div>

        <div className="hero-right">
          
          {/* Auto-playing hero video with play overlay for full modal */}
          <div className="hero-dashboard-mock-container" onClick={() => setVideoModalOpen(true)}>
            <video
              className="hero-autoplay-video"
              src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-close-up-40348-large.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            {/* Video Play Overlay */}
            <div className="video-play-overlay">
              <div className="play-btn-circle">
                <Play size={28} fill="white" style={{ marginLeft: '4px' }} />
              </div>
              <span className="play-btn-text">Watch Platform Tour</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Subject Catalog */}
      <section className="categories-section" id="catalog-section">
        <div className="section-header">
          <h2 className="section-title">Explore Career-Ready Catalog</h2>
          <p className="section-subtitle">Choose your track, build custom study planners, analyze your credentials, and practice interviews.</p>
        </div>

        {/* Courses Display Grid */}
        <div className="courses-grid">
          {coursesData.map(course => (
            <article className="course-card" key={course.id}>
              <div className="course-banner">
                {course.imageUrl && <img src={course.imageUrl} alt={course.title} className="course-banner-img" />}
                <div className="course-banner-gradient-overlay" style={{ background: course.themeGradient }} />
                <span className="course-badge">{course.badge}</span>
                <div className="course-banner-overlay-text">{course.provider}</div>
              </div>
              <div className="course-content">
                <div className="course-provider-row">
                  <span className={`provider-logo-badge ${course.provider.toLowerCase()}`}>{course.provider}</span>
                  <span className="course-provider-name">{course.provider}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                
                <div className="course-skills-gained">
                  <span className="skills-label">Skills you'll gain: </span>
                  <span className="skills-list">{course.skills.join(', ')}</span>
                </div>

                <div className="course-rating-row">
                  <span className="rating-score">{course.rating}</span>
                  <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                  <span className="rating-count">({(course.reviews / 1000).toFixed(course.reviews >= 10000 ? 0 : 1)}K reviews)</span>
                </div>

                <div className="course-meta-row">
                  <span className="meta-text">{course.level} • {course.badge} • {course.duration}</span>
                </div>

                <div className="course-action-row">
                  <button className="course-enroll-btn" onClick={() => setEnrollModal(course)}>
                    Enroll Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <StatsSection />

      {/* Learner Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Learners Achieve Career Goals</h2>
          <p className="section-subtitle">Read success stories from students who transitioned to leading tech careers using Anviora.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-card-inner">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />)}
              </div>
              <span className="quote-icon">“</span>
              <p className="testimonial-text">
                "The AI Interview Coach was a game-changer. It recorded my practice verbal answers, highlighted layout structures, and helped me drop filler words. I landed a software engineer position at Microsoft."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>SK</div>
              <div className="author-info">
                <span className="author-name">Siddharth K.</span>
                <span className="author-title">Software Engineer, Microsoft</span>
              </div>
              <div className="testimonial-company-badge">MSFT</div>
            </div>
          </div>

          <div className="testimonial-card testimonial-card--featured">
            <div className="testimonial-card-inner">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />)}
              </div>
              <span className="quote-icon">“</span>
              <p className="testimonial-text">
                "My resume was hitting a wall with automated scanners. Anviora's ATS Analyzer flagged exactly which cloud infrastructure keywords were missing. I upgraded my resume, and instantly got call-backs from recruiters."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}>MD</div>
              <div className="author-info">
                <span className="author-name">Maria D.</span>
                <span className="author-title">Cloud Administrator, AWS Solutions</span>
              </div>
              <div className="testimonial-company-badge">AWS</div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-card-inner">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />)}
              </div>
              <span className="quote-icon">“</span>
              <p className="testimonial-text">
                "Managing coding practice while learning machine learning concepts is challenging. The AI Study Planner helped chunk my weekly targets into small milestones. Reaching 100% XP kept me motivated every day!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' }}>AH</div>
              <div className="author-info">
                <span className="author-name">Alex H.</span>
                <span className="author-title">Data Scientist, Deloitte</span>
              </div>
              <div className="testimonial-company-badge">DLT</div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link to="/" className="brand-section">
              <div className="brand-logo">A</div>
              <span className="brand-name">Anviora</span>
            </Link>
            <p className="footer-brand-desc">
              Your AI-driven career acceleration assistant. Master coding roadmaps, scan credentials, secure placements, and interview confidently.
            </p>
            <span className="footer-brand-tagline">
              <Sparkles size={12} /> Powered by AI · Built for Careers
            </span>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Subjects</h3>
            <ul className="footer-menu">
              <li className="footer-menu-item"><button onClick={() => { setActiveCategory('cs'); document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' }); }}>Computer Science</button></li>
              <li className="footer-menu-item"><button onClick={() => { setActiveCategory('ds'); document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' }); }}>Data Science</button></li>
              <li className="footer-menu-item"><button onClick={() => { setActiveCategory('ai'); document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' }); }}>Artificial Intelligence</button></li>
              <li className="footer-menu-item"><button onClick={() => { setActiveCategory('biz'); document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' }); }}>Business & Management</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">AI Products</h3>
            <ul className="footer-menu">
              <li className="footer-menu-item"><Link to="/study">Milestone Study Planner</Link></li>
              <li className="footer-menu-item"><Link to="/skills">Visual Skill Analyzer</Link></li>
              <li className="footer-menu-item"><Link to="/resume">ATS Resume Matcher</Link></li>
              <li className="footer-menu-item"><Link to="/interview">AI Voice Interview Coach</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Company</h3>
            <ul className="footer-menu">
              <li className="footer-menu-item"><a href="#">About Us</a></li>
              <li className="footer-menu-item"><a href="#">Careers</a></li>
              <li className="footer-menu-item"><a href="#">Press Releases</a></li>
              <li className="footer-menu-item"><a href="#">Academic Partners</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Support</h3>
            <ul className="footer-menu">
              <li className="footer-menu-item"><a href="#">Help Center</a></li>
              <li className="footer-menu-item"><a href="#">Terms of Service</a></li>
              <li className="footer-menu-item"><a href="#">Privacy Policy</a></li>
              <li className="footer-menu-item"><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Anviora. Empowering educational breakthroughs. All rights reserved.</span>
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Github"><Sparkles size={16} /></a>
            <a href="#" className="social-icon" aria-label="LinkedIn"><Award size={16} /></a>
            <a href="#" className="social-icon" aria-label="Twitter"><TrendingUp size={16} /></a>
          </div>
        </div>
      </footer>
      

      {/* Enrollment Success Modal */}
      {enrollModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,11,16,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16 }}>
          <div className="feature-dashboard-mock" style={{ maxWidth: '480px', position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setEnrollModal(null)}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '16px 0' }}>
              <div className="webcam-avatar" style={{ border: '2px solid var(--accent-purple)', color: 'var(--accent-purple)', animation: 'none', marginBottom: 8 }}>
                <GraduationCap size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Enroll in Program</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>{enrollModal.title}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                Join this track and let Anviora scan your skills, index study checkpoints, and prepare specialized interview questions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button className="tab-btn" style={{ flex: 1, padding: '10px' }} onClick={() => setEnrollModal(null)}>Cancel</button>
              <Link to="/login" className="glow-button" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Create Free Account
              </Link>
              
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Video Modal */}
      {videoModalOpen && (
        <div className="video-modal-overlay" onClick={() => setVideoModalOpen(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setVideoModalOpen(false)} title="Close Video">
              <X size={24} />
            </button>
            <div className="video-player-container">
              <div className="video-player-wrapper">
                <video 
                  id="walkthrough-video"
                  src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-close-up-40348-large.mp4" 
                  autoPlay 
                  loop 
                  controls 
                  className="main-walkthrough-video"
                />
              </div>
              <div className="video-modal-sidebar">
                <h3 className="video-sidebar-title">Anviora Walkthrough</h3>
                <p className="video-sidebar-desc">Take a tour of our AI tools to help accelerate your career readiness and master skills.</p>
                <div className="video-timestamps-list">
                  <button className="timestamp-item" onClick={() => {
                    const video = document.getElementById('walkthrough-video');
                    if (video) { video.currentTime = 0; video.play(); }
                  }}>
                    <span className="timestamp-badge">0:00</span> Intro & Dashboard Overview
                  </button>
                  <button className="timestamp-item" onClick={() => {
                    const video = document.getElementById('walkthrough-video');
                    if (video) { video.currentTime = 3; video.play(); }
                  }}>
                    <span className="timestamp-badge">0:03</span> AI Study Planner
                  </button>
                  <button className="timestamp-item" onClick={() => {
                    const video = document.getElementById('walkthrough-video');
                    if (video) { video.currentTime = 6; video.play(); }
                  }}>
                    <span className="timestamp-badge">0:06</span> Skill Analyzer & Profiles
                  </button>
                  <button className="timestamp-item" onClick={() => {
                    const video = document.getElementById('walkthrough-video');
                    if (video) { video.currentTime = 9; video.play(); }
                  }}>
                    <span className="timestamp-badge">0:09</span> Resume ATS Matcher
                  </button>
                  <button className="timestamp-item" onClick={() => {
                    const video = document.getElementById('walkthrough-video');
                    if (video) { video.currentTime = 12; video.play(); }
                  }}>
                    <span className="timestamp-badge">0:12</span> Voice Interview Coach
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
