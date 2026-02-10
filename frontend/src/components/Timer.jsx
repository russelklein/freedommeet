import React from 'react';

export function Timer({ seconds, warning = 30 }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= warning;
  const isCritical = seconds <= 10;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: isCritical 
        ? 'rgba(232, 93, 117, 0.2)' 
        : isWarning 
          ? 'rgba(244, 162, 97, 0.2)' 
          : 'var(--bg-elevated)',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${isCritical 
        ? 'var(--error)' 
        : isWarning 
          ? 'var(--warning)' 
          : 'var(--border-subtle)'}`,
      transition: 'all 0.3s ease'
    }}>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isCritical ? 'var(--error)' : isWarning ? 'var(--warning)' : 'var(--text-secondary)'}
        strokeWidth="2"
        style={{
          animation: isCritical ? 'pulse 1s infinite' : 'none'
        }}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: '14px',
        color: isCritical 
          ? 'var(--error)' 
          : isWarning 
            ? 'var(--warning)' 
            : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
