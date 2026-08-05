import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { notificationService } from './services/notificationService';
import {
  Home as HomeIcon, Calendar, LineChart, FileText, Mic, Code,
  Activity, Briefcase, MessageSquare, User, Settings as SettingsIcon,
  Sun, Moon, LogOut, Bell, GraduationCap, Check, CheckCheck, X, Menu
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children, exact = false, onClick }) => {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <li className={`sidebar-item ${isActive ? 'active' : ''}`}>
      <Link to={to} onClick={onClick}><Icon size={18} /><span>{children}</span></Link>
    </li>
  );
};

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getAll()
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (_) {}
  };

  const markAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '340px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', zIndex: 9999, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Notifications {unread > 0 && <span style={{ background: '#6366f1', color: '#fff', borderRadius: '999px', fontSize: '0.72rem', padding: '1px 7px', marginLeft: '6px' }}>{unread}</span>}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {unread > 0 && (
            <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCheck size={14} /> All read
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
      </div>
      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Bell size={28} style={{ marginBottom: '10px', opacity: 0.4 }} /><br />No notifications yet
          </div>
        ) : notifications.map(n => (
          <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: n.is_read ? 'transparent' : 'rgba(99,102,241,0.06)', cursor: 'pointer' }}
            onClick={() => !n.is_read && markRead(n.id)}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.is_read ? 'transparent' : '#6366f1', marginTop: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: n.is_read ? '500' : '700', fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {!n.is_read && (
              <button onClick={e => { e.stopPropagation(); markRead(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}>
                <Check size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Pages that should render WITHOUT sidebar/topnav shell ────────────────────
const NO_SHELL_PATHS = ['/', '/login', '/register'];

const AppShell = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── KEY FIX: hide sidebar on landing + auth pages ──────────────────────────
  const isShellless = NO_SHELL_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!user) return;
    notificationService.getUnreadCount()
      .then(data => setUnreadCount(data?.count ?? 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Landing / Login / Register: render ONLY the routes, no sidebar or topnav
  if (isShellless) {
    return <AppRoutes />;
  }

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileNavOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <Link to="/dashboard" className="sidebar-brand" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none' }}>
          <div className="brand-logo">A</div>
          <span className="brand-name">Anviora</span>
        </Link>

        <ul className="sidebar-menu">
          <SidebarLink to="/dashboard" icon={HomeIcon} exact onClick={() => setMobileNavOpen(false)}>Home</SidebarLink>
          <li className="sidebar-divider" />
          <SidebarLink to="/study"      icon={Calendar} onClick={() => setMobileNavOpen(false)}>Study Planner</SidebarLink>
          <SidebarLink to="/skills"     icon={LineChart} onClick={() => setMobileNavOpen(false)}>Skill Analyzer</SidebarLink>
          <SidebarLink to="/resume"     icon={FileText} onClick={() => setMobileNavOpen(false)}>Resume Analyzer</SidebarLink>
          <SidebarLink to="/interview"  icon={Mic} onClick={() => setMobileNavOpen(false)}>Interview Coach</SidebarLink>
          <SidebarLink to="/projects"   icon={Code} onClick={() => setMobileNavOpen(false)}>Project Recommendations</SidebarLink>
          <SidebarLink to="/coding"     icon={Activity} onClick={() => setMobileNavOpen(false)}>Coding Tracker</SidebarLink>
          <SidebarLink to="/placements" icon={Briefcase} onClick={() => setMobileNavOpen(false)}>Placement Tracker</SidebarLink>
          <li className="sidebar-divider" />
          <SidebarLink to="/mentor"     icon={MessageSquare} onClick={() => setMobileNavOpen(false)}>AI Mentor</SidebarLink>
          <li className="sidebar-divider" />
          <SidebarLink to="/profile"    icon={User} onClick={() => setMobileNavOpen(false)}>Profile</SidebarLink>
          <SidebarLink to="/settings"   icon={SettingsIcon} onClick={() => setMobileNavOpen(false)}>Settings</SidebarLink>
          <li className="sidebar-item" style={{ marginTop: 'auto' }}>
            <button
              onClick={() => { setMobileNavOpen(false); if (window.confirm('Are you sure you want to logout?')) logout(); }}
              style={{
                background: 'none', border: 'none', width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '10px 16px', color: '#ef4444', fontSize: '0.88rem', fontWeight: '600',
                cursor: 'pointer', textAlign: 'left', borderRadius: '8px'
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>

        {user && (
          <div className="sidebar-footer">
            <Link to="/profile" className="user-profile-summary" onClick={() => setMobileNavOpen(false)}>
              <div className="user-avatar">{user.avatar || 'US'}</div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </Link>
            <button
              onClick={() => { setMobileNavOpen(false); if (window.confirm('Are you sure you want to logout?')) logout(); }}
              className="nav-icon-btn"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileNavOpen(p => !p)}
              title="Toggle Menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={{ fontSize: '1.05rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={22} className="gradient-text" />
              <span className="top-nav-title">Career Readiness Portal</span>
            </span>
          </div>
          <div className="nav-actions">
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="nav-icon-btn" title="Notifications" onClick={() => setNotifOpen(p => !p)} style={{ position: 'relative' }}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.62rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
            </div>
            <Link to="/profile">
              <div className="user-avatar" style={{ cursor: 'pointer', width: '34px', height: '34px', fontSize: '0.85rem' }}>
                {user?.avatar || 'US'}
              </div>
            </Link>
            <button
              onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }}
              className="nav-icon-btn nav-logout-desktop"
              title="Sign Out / Logout"
              style={{ color: '#ef4444' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="page-wrapper">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;