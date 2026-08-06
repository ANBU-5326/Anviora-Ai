import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, AlertTriangle } from 'lucide-react';
import Landing from '../Landing/Landing';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleStep, setGoogleStep] = useState(1);
  const { login, googleLogin, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const activePassword = password || 'anviora123';
    const activeName = name || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    try {
      if (isSignUp) {
        const res = await register({
          name: activeName,
          email,
          password: activePassword,
          role: 'Student'
        });
        if (res.success) {
          navigate('/home');
        } else {
          setError(res.message);
        }
      } else {
        let res = await login(email, activePassword);
        if (res.success) {
          navigate('/home');
        } else {
          // If login failed because user does not exist yet, auto-register for a seamless Join experience!
          if (res.message && (res.message.includes('Invalid') || res.message.includes('not found') || res.message.includes('credentials'))) {
            const regRes = await register({
              name: activeName,
              email,
              password: activePassword,
              role: 'Student'
            });
            if (regRes.success) {
              navigate('/home');
              return;
            }
          }
          setError(res.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (selectedEmail, selectedName) => {
    setLoading(true);
    setError('');
    setShowGoogleModal(false);
    try {
      const res = await googleLogin(selectedEmail, selectedName);
      if (res.success) {
        navigate('/home');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail) return;
    const name = googleName || googleEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    handleGoogleSelect(googleEmail, name);
  };

  const handleSocialClick = (platform) => {
    if (platform === 'Google') {
      setShowGoogleModal(true);
      setError('');
    } else {
      setError(`Social sign-in with ${platform} is currently disabled. Please use your standard email/password.`);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100vw',
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '20px 0',
      fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Real Live Landing Page in background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        filter: 'blur(1.5px)',
        opacity: 0.9,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 1
      }}>
        <Landing />
      </div>

      {/* Dark overlay backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(10, 11, 16, 0.25)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Centered Modal Card */}
      <div className="login-modal-card" style={{
        position: 'relative',
        width: 'min(92vw, 410px)',
        maxHeight: '90dvh',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #d1d5db',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        padding: 'clamp(18px, 4vw, 28px)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box'
      }}>
        {/* Close Button X */}
        <button 
          onClick={() => navigate('/')} 
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1f1f1f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          title="Go back"
        >
          <X size={18} />
        </button>

        {/* Title & Subtitle */}
        <div style={{ textAlign: 'left', marginTop: '4px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f1f1f',
            margin: '0 0 6px 0',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em'
          }}>Log in or create account</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#5c5c5c',
            margin: 0,
            lineHeight: '1.45',
            fontFamily: 'inherit'
          }}>Learn on your own time from top universities and businesses.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#d93025',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name Field (Sign Up) */}
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>
                Full Name <span style={{ color: '#d93025' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #bdbdbd',
                  borderRadius: '4px', fontSize: '0.95rem', color: '#1f1f1f',
                  backgroundColor: '#ffffff', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none'
                }}
              />
            </div>
          )}

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#374151'
            }}>
              Email <span style={{ color: '#d93025' }}>*</span>
            </label>
            <input 
              type="email" 
              placeholder="name@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #bdbdbd',
                borderRadius: '4px',
                fontSize: '0.95rem',
                color: '#1f1f1f',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#374151'
            }}>
              Password (Optional)
            </label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #bdbdbd',
                borderRadius: '4px',
                fontSize: '0.95rem',
                color: '#1f1f1f',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: '#0056D2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 20px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxSizing: 'border-box',
              width: '100%',
              textAlign: 'center',
              marginTop: '4px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0041a8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0056D2'}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Join Anviora AI for Free' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#0056D2', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Join for free"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '500' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Social Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Google */}
          <button 
            type="button" 
            onClick={() => handleSocialClick('Google')}
            style={socialButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Facebook */}
          <button 
            type="button" 
            onClick={() => handleSocialClick('Facebook')}
            style={socialButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          {/* Apple */}
          <button 
            type="button" 
            onClick={() => handleSocialClick('Apple')}
            style={socialButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Footer Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
          <a href="#" style={{
            color: '#0056D2',
            fontSize: '0.875rem',
            fontWeight: '600',
            textDecoration: 'underline',
            fontFamily: 'inherit'
          }}>Sign up with your organization</a>
        </div>

        {/* Terms Disclaimer */}
        <p style={{
          fontSize: '0.725rem',
          color: '#5c5c5c',
          lineHeight: '1.4',
          margin: '4px 0 0 0',
          fontFamily: 'inherit'
        }}>
          I accept Anviora's <a href="#" style={{ color: '#0056D2', textDecoration: 'underline' }}>Terms of Use</a> and <a href="#" style={{ color: '#0056D2', textDecoration: 'underline' }}>Privacy Notice</a>. Having trouble logging in? <a href="#" style={{ color: '#0056D2', textDecoration: 'underline' }}>Learner Help Center</a>
        </p>

        {/* ReCAPTCHA disclaimer */}
        <p style={{
          fontSize: '0.675rem',
          color: '#5c5c5c',
          lineHeight: '1.35',
          margin: 0,
          fontFamily: 'inherit'
        }}>
          This site is protected by reCAPTCHA Enterprise and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#0056D2', textDecoration: 'underline' }}>Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#0056D2', textDecoration: 'underline' }}>Terms of Service</a> apply.
        </p>
      </div>

      {/* Google Sign-in Modal */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: "'Roboto', sans-serif"
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            width: '90%',
            maxWidth: '380px',
            padding: '36px 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Styles for hover */}
            <style>{`
              .google-account-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 10px;
                border-top: 1px solid #e8eaed;
                cursor: pointer;
                transition: background-color 0.15s;
                border-radius: 4px;
                text-align: left;
              }
              .google-account-row:hover {
                background-color: #f7f8f9;
              }
            `}</style>

            {/* Close modal */}
            <button
              onClick={() => { setShowGoogleModal(false); setGoogleStep(1); }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#5f6368'
              }}
            >
              &times;
            </button>

            {/* Google Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>

            {googleStep === 1 ? (
              <>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#202124',
                  margin: '0 0 8px 0',
                  textAlign: 'center',
                  lineHeight: 1.3
                }}>Choose an account</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#5f6368',
                  margin: '0 0 24px 0',
                  textAlign: 'center'
                }}>to continue to <strong style={{ color: '#202124' }}>Anviora AI</strong></p>

                {/* Account list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
                  <div
                    onClick={() => handleGoogleSelect('demouser@anviora.ai', 'Demo User')}
                    className="google-account-row"
                  >
                    <div style={googleAvatarStyle}>DU</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#3c4043' }}>Demo User</div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>demouser@anviora.ai</div>
                    </div>
                  </div>
                  <div
                    onClick={() => handleGoogleSelect('anbumani@gmail.com', 'Anbumani')}
                    className="google-account-row"
                  >
                    <div style={{ ...googleAvatarStyle, backgroundColor: '#a855f7' }}>A</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#3c4043' }}>Anbumani</div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>anbumani@gmail.com</div>
                    </div>
                  </div>
                  
                  {/* Option to enter custom */}
                  <div
                    onClick={() => setGoogleStep(2)}
                    className="google-account-row"
                    style={{ borderBottom: '1px solid #e8eaed' }}
                  >
                    <div style={{
                      ...googleAvatarStyle,
                      backgroundColor: '#f1f3f4',
                      color: '#5f6368',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="16" y1="11" x2="22" y2="11"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a73e8', paddingLeft: '4px' }}>Use another account</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#202124',
                  margin: '0 0 8px 0',
                  textAlign: 'center'
                }}>Sign in</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#5f6368',
                  margin: '0 0 24px 0',
                  textAlign: 'center'
                }}>with your Google Account</p>

                <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="email"
                    placeholder="Email or phone"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    style={googleInputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    style={googleInputStyle}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setGoogleStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1a73e8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '8px 0'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#1a73e8',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </>
            )}

            <p style={{
              fontSize: '12px',
              color: '#5f6368',
              lineHeight: 1.4,
              margin: '24px 0 0 0',
              textAlign: 'left'
            }}>
              To continue, Google will share your name, email address, language preference, and profile picture with Anviora AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const googleAvatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#1a73e8',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const googleInputStyle = {
  width: '100%',
  padding: '16px 14px',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  fontSize: '16px',
  color: '#202124',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit'
};

const socialButtonStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: '0.925rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

export default Login;
