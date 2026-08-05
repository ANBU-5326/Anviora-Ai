import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Sparkles, Tv, Chrome, Search, Layers, Play, CheckCircle, Copy, Check } from 'lucide-react';

const LoadingDemo = () => {
  const [selectedSize, setSelectedSize] = useState('md');
  const [customText, setCustomText] = useState('Loading resources...');
  const [activeGlobalLoader, setActiveGlobalLoader] = useState('google-spinner');
  const [fullscreenVariant, setFullscreenVariant] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('preferred-loader') || 'google-spinner';
    setActiveGlobalLoader(saved);
  }, []);

  const handleSetGlobal = (variant) => {
    localStorage.setItem('preferred-loader', variant);
    setActiveGlobalLoader(variant);
    setSaveSuccess(variant);
    
    // Dispatch a custom event to notify other components (e.g. settings or layout) if needed
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setSaveSuccess(null);
    }, 2000);
  };

  const handleSimulateFullscreen = (variant) => {
    setFullscreenVariant(variant);
    setTimeout(() => {
      setFullscreenVariant(null);
    }, 3000); // Auto close after 3 seconds
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadersList = [
    {
      id: 'premium',
      name: 'Quantum Premium Orbit',
      description: 'The standard sci-fi inspired loader featuring outer and inner orbiting rings with an ambient cyan-purple glow.',
      icon: Sparkles,
      color: 'var(--accent-purple)',
      bgColor: 'rgba(139, 92, 246, 0.05)',
      code: (size, text) => `<LoadingSpinner variant="premium" size="${size}" text="${text || ''}" />`
    },
    {
      id: 'google-spinner',
      name: 'Google Material Circular',
      description: 'Google\'s official four-color rotating circular spinner, fading dynamically between blue, red, yellow, and green.',
      icon: Chrome,
      color: '#4285F4',
      bgColor: 'rgba(66, 133, 244, 0.05)',
      code: (size, text) => `<LoadingSpinner variant="google-spinner" size="${size}" text="${text || ''}" />`
    },
    {
      id: 'google-dots',
      name: 'Google Assistant Dots',
      description: 'Four horizontal dots colored in Google\'s signature branding, bouncing in a playful rhythmic wave.',
      icon: Search,
      color: '#34A853',
      bgColor: 'rgba(52, 168, 83, 0.05)',
      code: (size, text) => `<LoadingSpinner variant="google-dots" size="${size}" text="${text || ''}" />`
    },
    {
      id: 'youtube-spinner',
      name: 'YouTube Player Spinner',
      description: 'The lightweight, high-speed circular loading spinner with a thin crimson profile featured on YouTube videos.',
      icon: Tv,
      color: '#FF0000',
      bgColor: 'rgba(255, 0, 0, 0.05)',
      code: (size, text) => `<LoadingSpinner variant="youtube-spinner" size="${size}" text="${text || ''}" />`
    },
    {
      id: 'youtube-bar',
      name: 'YouTube Navigation Progress',
      description: 'A crimson progress bar that sweeps smoothly along the very top edge of the parent container or viewport screen.',
      icon: Layers,
      color: '#FF0000',
      bgColor: 'rgba(255, 0, 0, 0.05)',
      code: (size, text) => `<LoadingSpinner variant="youtube-bar" size="${size}" text="${text || ''}" />`
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Layers className="gradient-text" size={32} /> Loading Styles & Symbols
        </h1>
        <p className="page-description">
          Preview, customize, and configure beautiful loading visual elements. You can select any loader style to apply as your default application theme below.
        </p>
      </div>

      {/* Controller Area */}
      <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
        {/* Custom text loader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Loading Custom Text</label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Gathering insights..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Custom size controller */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Loader Size Dimension</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['sm', 'md', 'lg'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  backgroundColor: selectedSize === size ? 'var(--accent-purple)' : 'var(--bg-primary)',
                  color: selectedSize === size ? '#ffffff' : 'var(--text-secondary)',
                  border: selectedSize === size ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                {size === 'sm' && 'Small'}
                {size === 'md' && 'Medium'}
                {size === 'lg' && 'Large'}
              </button>
            ))}
          </div>
        </div>

        {/* Banner/Info */}
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CheckCircle size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            <strong>Global Sync Active:</strong> Clicking "Set Default" writes to local preferences. This automatically overrides the initial page boot loader.
          </p>
        </div>
      </div>

      {/* Grid of Loaders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {loadersList.map((loader, index) => {
          const Icon = loader.icon;
          const isGlobal = activeGlobalLoader === loader.id;
          const codeString = loader.code(selectedSize, customText);

          return (
            <div key={loader.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', borderTop: isGlobal ? '4px solid var(--accent-purple)' : '1px solid var(--glass-border)' }}>
              
              {/* Badge for active default */}
              {isGlobal && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={10} /> Active Default
                </span>
              )}

              {/* Title & Desc */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', backgroundColor: loader.bgColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: loader.color }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '80%' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>{loader.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{loader.description}</p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{
                height: '140px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <LoadingSpinner variant={loader.id} size={selectedSize} text={customText} />
              </div>

              {/* Code Snippet Box */}
              <div style={{ position: 'relative' }}>
                <pre style={{
                  backgroundColor: 'var(--text-primary)',
                  color: '#e2e8f0',
                  padding: '12px 36px 12px 14px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'Consolas, Courier, monospace',
                  overflowX: 'auto',
                  margin: 0
                }}>
                  {codeString}
                </pre>
                <button
                  onClick={() => copyToClipboard(codeString, index)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: copiedIndex === index ? '#10b981' : '#94a3b8',
                    display: 'flex',
                    background: 'none',
                    border: 'none'
                  }}
                  title="Copy JSX Code"
                >
                  {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button
                  onClick={() => handleSetGlobal(loader.id)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: isGlobal ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    border: isGlobal ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
                    color: isGlobal ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                  disabled={isGlobal}
                >
                  {saveSuccess === loader.id ? (
                    <>
                      <Check size={14} style={{ color: '#10b981' }} />
                      <span>Configured!</span>
                    </>
                  ) : isGlobal ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Active Default</span>
                    </>
                  ) : (
                    <span>Set Default</span>
                  )}
                </button>

                <button
                  onClick={() => handleSimulateFullscreen(loader.id)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--accent-purple)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Play size={14} />
                  <span>Simulate Overlay</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Floating Fullscreen Simulation overlay */}
      {fullscreenVariant && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <LoadingSpinner variant={fullscreenVariant} size="lg" fullScreen={true} text={`${customText} (Closing in 3s...)`} />
        </div>
      )}
    </div>
  );
};

export default LoadingDemo;
