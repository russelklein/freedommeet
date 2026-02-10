import React from 'react';

export function ChatMessage({ message, isOwn }) {
  return (
    <div 
      className="slide-up"
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '10px',
        marginBottom: '12px'
      }}
    >
      <img
        src={message.fromPhoto}
        alt={message.fromName}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          objectFit: 'cover',
          border: '2px solid var(--bg-elevated)',
          flexShrink: 0
        }}
      />
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start'
      }}>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '4px',
          paddingLeft: isOwn ? 0 : '12px',
          paddingRight: isOwn ? '12px' : 0
        }}>
          {message.fromName}
        </span>
        <div style={{
          background: isOwn 
            ? 'linear-gradient(135deg, var(--accent-primary), #c9485b)' 
            : 'var(--bg-elevated)',
          color: isOwn ? 'white' : 'var(--text-primary)',
          padding: '10px 14px',
          borderRadius: isOwn 
            ? '16px 16px 4px 16px' 
            : '16px 16px 16px 4px',
          fontSize: '14px',
          lineHeight: '1.4',
          boxShadow: 'var(--shadow-sm)',
          wordBreak: 'break-word'
        }}>
          {message.message}
        </div>
      </div>
    </div>
  );
}
