import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Briefcase, FileText, CheckCircle2, Save, X, Plus, Settings } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Student');
  const [bio, setBio] = useState(user?.bio || '');
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name, role, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skills = user?.skills || [];
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    updateUserProfile({
      skills: [...skills, newSkill.trim()]
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const skills = user?.skills || [];
    updateUserProfile({
      skills: skills.filter(s => s !== skillToRemove)
    });
  };

  const fieldStyle = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block'
  };

  return (
    <div className="profile-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'inherit' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: "rgba(167, 139, 250, 0.15)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
          <Settings size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: -0.3 }}>User Profile</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>Manage your identity, bio descriptions, and skills list for personalized AI recommendations.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile Details Editor */}
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Account Specifications</h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                style={fieldStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label style={labelStyle}>Role / Occupation</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ ...fieldStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="Student">Student</option>
                <option value="Graduate">Recent Graduate</option>
                <option value="Professional">Working Professional</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Bio / Objective</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                style={fieldStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {saved ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#34d399', 
                justifyContent: 'center',
                padding: '10px',
                backgroundColor: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                <CheckCircle2 size={14} /> Profile details saved!
              </div>
            ) : (
              <button type="submit" className="glow-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', fontWeight: '600' }}>
                <Save size={16} /> Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Identity Card & Skills List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Identity Overview */}
          <div className="glass-panel" style={{ 
            padding: '28px', 
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%), var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px' 
          }}>
            <div className="user-avatar" style={{ 
              width: '76px', 
              height: '76px', 
              fontSize: '1.6rem',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              border: '4px solid var(--bg-secondary)',
              boxShadow: '0 0 0 2px var(--accent-purple)'
            }}>
              {user?.avatar || 'US'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{user?.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: '700' }}>{user?.role}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {user?.email}
              </span>
            </div>
          </div>

          {/* Manage Skills Card */}
          <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Manage Tagged Skills</h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map(skill => (
                  <span key={skill} style={{ 
                    fontSize: '0.8rem', 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-secondary)',
                    padding: '6px 12px', 
                    borderRadius: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    cursor: 'default'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {skill}
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={`Remove ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills added. Add skills to start customizing recommendations.</span>
              )}
            </div>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <input 
                type="text" 
                placeholder="Add skill (e.g. Next.js, Go)" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                required
                style={{ ...fieldStyle, flex: 1, height: '40px', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
              <button 
                type="submit" 
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  height: '40px',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
