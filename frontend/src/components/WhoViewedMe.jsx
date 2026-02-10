import React from 'react';

export function WhoViewedMe({ views, onViewProfile, onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 100%)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <button
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#f5f2ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d2926" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>
            Who Viewed Me
          </h1>
          <p style={{ fontSize: '13px', color: '#8a8482' }}>
            {views.length} view{views.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {views.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#8a8482'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👀</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No views yet</p>
            <p style={{ fontSize: '14px' }}>When someone views your profile, they'll appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {views.map(view => (
              <ViewCard
                key={view.userId}
                view={view}
                onView={() => onViewProfile(view.profile)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewCard({ view, onView }) {
  const { profile, viewedAt, isOnline } = view;
  const photo = profile.photos?.[0] || profile.photo;
  
  return (
    <button
      onClick={onView}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        width: '100%',
        textAlign: 'left'
      }}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '14px',
        background: `url(${photo}) center/cover`,
        flexShrink: 0,
        position: 'relative'
      }}>
        {isOnline && (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#4abe7a',
            border: '2px solid #fff'
          }} />
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '16px', color: '#2d2926' }}>
          {profile.name}{profile.age ? `, ${profile.age}` : ''}
        </p>
        {profile.city && (
          <p style={{ fontSize: '13px', color: '#8a8482' }}>📍 {profile.city}</p>
        )}
        <p style={{ fontSize: '12px', color: '#b8a9ad', marginTop: '4px' }}>
          Viewed {formatTimeAgo(viewedAt)}
        </p>
      </div>
      
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d0cbc8" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
