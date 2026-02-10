import React from 'react';

export function UserCard({ user, size = 'medium' }) {
  const sizes = {
    small: { img: 48, name: 12 },
    medium: { img: 80, name: 14 },
    large: { img: 120, name: 18 }
  };

  const s = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        position: 'relative',
        width: s.img,
        height: s.img
      }}>
        <img
          src={user.photo}
          alt={user.name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
            border: '3px solid var(--bg-elevated)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '12px',
          height: '12px',
          background: 'var(--success)',
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--bg-card)'
        }} />
      </div>
      <span style={{
        fontSize: s.name,
        fontWeight: 500,
        color: 'var(--text-primary)',
        textAlign: 'center',
        maxWidth: s.img + 40,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {user.name}
      </span>
    </div>
  );
}
