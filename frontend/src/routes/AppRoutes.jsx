import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';

import Landing from '../pages/Landing/Landing';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import StudyPlanner from '../pages/StudyPlanner/StudyPlanner';
import SkillAnalyzer from '../pages/SkillAnalyzer/SkillAnalyzer';
import ResumeAnalyzer from '../pages/ResumeAnalyzer/ResumeAnalyzer';
import InterviewCoach from '../pages/InterviewCoach/InterviewCoach';
import ProjectRecommendation from '../pages/ProjectRecommendation/ProjectRecommendation';
import CodingTracker from '../pages/CodingTracker/CodingTracker';
import PlacementTracker from '../pages/PlacementTracker/PlacementTracker';
import AIMentor from '../pages/AIMentor/AIMentor';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Loaders ──────────────────────────────────────────────────────────────── */
const LoadingScreen = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    gap: '24px'
  }}>
    <LoadingSpinner size="lg" />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '0.05em', background: 'linear-gradient(135deg, #0f172a, #475569)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>ANVIORA AI</h2>
      <p style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, letterSpacing: '0.15em', margin: 0 }}>PREPARING YOUR WORKSPACE</p>
    </div>
  </div>
);

/* ─── Connection error: only shown inside protected routes ─────────────────── */
const ConnectionErrorScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7ff', fontFamily: "'Outfit','Inter',sans-serif", padding: 20, boxSizing: 'border-box', color: '#0f172a' }}>
    <div style={{ maxWidth: 420, width: '100%', backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #bae6fd', boxShadow: '0 10px 30px rgba(14,165,233,0.08)', padding: '40px 32px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Server Connection Failed</h2>
      <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 28px 0' }}>
        Could not connect to the Anviora AI backend. Make sure FastAPI server is running at <code style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: 4 }}>{BASE_URL}</code>.
      </p>
      <button onClick={() => window.location.reload()} style={{ width: '100%', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'background-color 0.2s' }}>
        Retry Connection
      </button>
    </div>
  </div>
);

/* ─── Route guards ─────────────────────────────────────────────────────────── */

/**
 * ProtectedRoute: requires login.
 * Shows loading while auth resolves.
 * Shows connection error only inside protected routes (not on landing/login).
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading, connectionError } = useAuth();
  if (loading) return <LoadingScreen />;
  if (connectionError) return <ConnectionErrorScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/**
 * PublicOnlyRoute: login/register pages.
 * Redirects already-logged-in users to /dashboard.
 * Does NOT redirect for the landing page — landing is open to everyone.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ─── Routes ───────────────────────────────────────────────────────────────── */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ── LANDING: always accessible, no auth check ── */}
      <Route path="/" element={<Landing />} />

      {/* ── AUTH: redirect logged-in users to dashboard ── */}
      <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* ── PROTECTED: require login ── */}
      <Route path="/home"       element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/study"      element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
      <Route path="/skills"     element={<ProtectedRoute><SkillAnalyzer /></ProtectedRoute>} />
      <Route path="/resume"     element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/interview"  element={<ProtectedRoute><InterviewCoach /></ProtectedRoute>} />
      <Route path="/projects"   element={<ProtectedRoute><ProjectRecommendation /></ProtectedRoute>} />
      <Route path="/coding"     element={<ProtectedRoute><CodingTracker /></ProtectedRoute>} />
      <Route path="/placements" element={<ProtectedRoute><PlacementTracker /></ProtectedRoute>} />
      <Route path="/mentor"     element={<ProtectedRoute><AIMentor /></ProtectedRoute>} />
      <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* ── FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;