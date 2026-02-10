import React from 'react';

export function Queue({ status, onLeave }) {
  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
      }}
    >
      {/* Animated searching indicator */}
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px',
        marginBottom: '32px'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius-full)',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '15px',
          borderRadius: 'var(--radius-full)',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-secondary)',
          animation: 'spin 1.5s linear infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          inset: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-elevated)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        fontWeight: 500,
        marginBottom: '8px',
        color: 'var(--text-primary)'
      }}>
        Finding your match...
      </h2>
      
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginBottom: '32px'
      }}>
        {status?.position 
          ? `Position in queue: ${status.position}`
          : 'Looking for someone special'}
      </p>

      <button
        onClick={onLeave}
        style={{
          padding: '12px 32px',
          background: 'transparent',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'var(--text-muted)';
          e.target.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'var(--border-subtle)';
          e.target.style.color = 'var(--text-secondary)';
        }}
      >
        Leave Queue
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
