import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ variant = '', size = 'md', fullScreen = false, text = '' }) => {
  const [preferredVariant, setPreferredVariant] = useState(
    () => localStorage.getItem('preferred-loader') || 'google-spinner'
  );

  useEffect(() => {
    if (variant) return;
    const handleStorage = () => {
      setPreferredVariant(localStorage.getItem('preferred-loader') || 'google-spinner');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [variant]);

  const activeVariant = variant || preferredVariant;

  // Dimensions based on size and variant
  const getDimensions = () => {
    switch (activeVariant) {
      case 'google-dots':
        return {
          sm: { dotSize: 4, gap: 3 },
          md: { dotSize: 7, gap: 5 },
          lg: { dotSize: 10, gap: 8 }
        }[size] ?? { dotSize: 7, gap: 5 };
      case 'youtube-bar':
        return { sm: 2, md: 3, lg: 4 }[size] ?? 3;
      default: // premium, google-spinner, youtube-spinner
        return { sm: 20, md: 32, lg: 48 }[size] ?? 32; // Compact diameter
    }
  };

  const dim = getDimensions();

  // YouTube Top Bar Progress State
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activeVariant !== 'youtube-bar') return;
    
    // Simulate loading progress
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          // Slow down progress as it approaches the end
          return prev + (98 - prev) * 0.05;
        }
        return prev + Math.random() * 12;
      });
    }, 150);

    return () => {
      clearInterval(interval);
    };
  }, [activeVariant]);

  // Wrapper Styles
  const getWrapperStyle = () => {
    if (activeVariant === 'youtube-bar' && !fullScreen) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${dim}px`,
        zIndex: 9990,
        pointerEvents: 'none'
      };
    }

    return fullScreen
      ? {
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          gap: 20,
          transition: 'all 0.3s ease',
        }
      : {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '24px',
        };
  };

  // Text Styling based on variant
  const getTextStyle = () => {
    switch (activeVariant) {
      case 'google-spinner':
      case 'google-dots':
        return {
          fontFamily: "'Roboto', 'Segoe UI', sans-serif",
          fontSize: '0.85rem',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          letterSpacing: '0.01em',
          marginTop: activeVariant === 'google-dots' ? '12px' : '4px'
        };
      case 'youtube-bar':
      case 'youtube-spinner':
        return {
          fontFamily: "'Roboto', 'Segoe UI', sans-serif",
          fontSize: '0.85rem',
          fontWeight: '500',
          color: '#ff0000',
          letterSpacing: '0.02em'
        };
      default: // premium
        return {
          fontFamily: 'var(--font-heading)',
          fontSize: '0.875rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'pulseGlow 2s ease-in-out infinite',
        };
    }
  };

  // Renders the spinner elements
  const renderLoaderContent = () => {
    switch (activeVariant) {
      case 'google-spinner':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 50 50" style={{
              animation: 'googleSpinnerRotate 2s linear infinite',
              width: dim,
              height: dim
            }}>
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{
                  animation: 'googleSpinnerDash 1.5s ease-in-out infinite, googleSpinnerColors 6s ease-in-out infinite',
                }}
              />
            </svg>
          </div>
        );

      case 'google-dots':
        return (
          <div style={{
            display: 'flex',
            gap: `${dim.gap}px`,
            alignItems: 'center',
            justifyContent: 'center',
            height: `${dim.dotSize * 2}px`
          }}>
            <div style={{ width: dim.dotSize, height: dim.dotSize, borderRadius: '50%', backgroundColor: '#4285F4', animation: 'googleDotsBounce 1s ease-in-out infinite', animationDelay: '0s' }} />
            <div style={{ width: dim.dotSize, height: dim.dotSize, borderRadius: '50%', backgroundColor: '#EA4335', animation: 'googleDotsBounce 1s ease-in-out infinite', animationDelay: '0.15s' }} />
            <div style={{ width: dim.dotSize, height: dim.dotSize, borderRadius: '50%', backgroundColor: '#FBBC05', animation: 'googleDotsBounce 1s ease-in-out infinite', animationDelay: '0.30s' }} />
            <div style={{ width: dim.dotSize, height: dim.dotSize, borderRadius: '50%', backgroundColor: '#34A853', animation: 'googleDotsBounce 1s ease-in-out infinite', animationDelay: '0.45s' }} />
          </div>
        );

      case 'youtube-bar':
        return (
          <>
            <div style={{
              position: fullScreen ? 'fixed' : 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${dim}px`,
              backgroundColor: 'rgba(255, 0, 0, 0.05)',
              zIndex: 99999,
              pointerEvents: 'none'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#ff0000',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.8), 0 0 5px rgba(255, 0, 0, 0.5)',
                transition: 'width 0.15s cubic-bezier(0.1, 0.8, 0.1, 1)',
              }} />
            </div>
            {/* If fullscreen, render a YouTube themed indicator in the center so the page isn't blank */}
            {fullScreen && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '3.5px solid rgba(255, 0, 0, 0.1)',
                  borderTopColor: '#ff0000',
                  animation: 'youtubeSpinnerRotate 0.8s linear infinite'
                }} />
              </div>
            )}
          </>
        );

      case 'youtube-spinner':
        return (
          <div style={{
            width: dim,
            height: dim,
            borderRadius: '50%',
            border: '3.5px solid rgba(255, 0, 0, 0.1)',
            borderTopColor: '#ff0000',
            animation: 'youtubeSpinnerRotate 0.8s linear infinite'
          }} />
        );

      default: // 'premium'
        const stroke = Math.max(2, dim * 0.05);
        return (
          <div style={{ position: 'relative', width: dim, height: dim }}>
            {/* Outer Ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `${stroke}px solid transparent`,
              borderTopColor: 'var(--accent-purple)',
              borderBottomColor: 'var(--accent-blue)',
              animation: 'orbitSpinner 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
            }} />
            
            {/* Inner Ring (Reverse) */}
            <div style={{
              position: 'absolute',
              inset: `${stroke * 2}px`,
              borderRadius: '50%',
              border: `${stroke}px solid transparent`,
              borderLeftColor: 'var(--accent-cyan)',
              borderRightColor: 'var(--accent-pink)',
              animation: 'orbitSpinnerReverse 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
              opacity: 0.8,
            }} />

            {/* Central Pulsing Particle */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${dim * 0.18}px`,
              height: `${dim * 0.18}px`,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              boxShadow: '0 0 12px var(--accent-purple)',
              animation: 'pulseGlow 1.5s ease-in-out infinite',
            }} />
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        /* Premium Loader Keys */
        @keyframes orbitSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitSpinnerReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
        }

        /* Google Spinner Keys */
        @keyframes googleSpinnerRotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes googleSpinnerDash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
        @keyframes googleSpinnerColors {
          0%, 100% { stroke: #4285F4; }
          25% { stroke: #EA4335; }
          50% { stroke: #FBBC05; }
          75% { stroke: #34A853; }
        }

        /* Google Dots Keys */
        @keyframes googleDotsBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* YouTube Spinner Keys */
        @keyframes youtubeSpinnerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={getWrapperStyle()}>
        {renderLoaderContent()}
        {text && <span style={getTextStyle()}>{text}</span>}
      </div>
    </>
  );
};

export default LoadingSpinner;
