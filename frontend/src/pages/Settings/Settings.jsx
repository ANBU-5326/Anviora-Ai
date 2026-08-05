import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Shield, Sliders, CheckCircle2, Save } from 'lucide-react';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(false);

  // API Integration states
  const [openAiKey, setOpenAiKey] = useState('sk-proj-••••••••••••••••••••');
  const [githubSync, setGithubSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Configuration & Settings</h1>
        <p className="page-description">Configure theme aesthetics, configure background email alarms, and enter API integration credentials.</p>
      </div>

      <div className="grid-2">
        {/* Visual Settings & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>


          {/* Notifications config */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--accent-cyan)' }} /> Notification Alarms
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Summaries</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Send weekly digest logs of my achievements and coding trackers.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={jobAlerts}
                  onChange={(e) => setJobAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Job Placement Recommendations</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notify me immediately when matching vacancies are updated.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={milestoneAlerts}
                  onChange={(e) => setMilestoneAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Study Milestone Reminders</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remind me of study tasks that are close to target dates.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* API keys & Save options */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'space-between' }}>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--accent-pink)' }} /> Integration Credentials
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OpenAI / Gemini Model token (Mock)</label>
              <input 
                type="password" 
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '4px' }}>
              <input 
                type="checkbox" 
                checked={githubSync}
                onChange={(e) => setGithubSync(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Synchronize LeetCode metrics (Mock)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-sync submission graphs on profile landing.</span>
              </div>
            </label>

            {saved ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#34d399', 
                justifyContent: 'center',
                padding: '10px',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <CheckCircle2 size={14} /> Settings synced successfully!
              </div>
            ) : (
              <button type="submit" className="glow-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', marginTop: '16px' }}>
                <Save size={16} /> Sync Configuration
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
