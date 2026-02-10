import React, { useState } from 'react';

export function LikesAndMatches({ 
  likes, 
  matches, 
  onLikeBack, 
  onRemoveLike, 
  onUnmatch,
  onScheduleChat,
  onViewProfile,
  onBack 
}) {
  const [activeTab, setActiveTab] = useState('likes');
  const [scheduleModal, setScheduleModal] = useState(null);

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
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>
          Connections
        </h1>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <button
          onClick={() => setActiveTab('likes')}
          style={{
            flex: 1,
            padding: '16px',
            fontWeight: 600,
            fontSize: '15px',
            color: activeTab === 'likes' ? '#e85d75' : '#8a8482',
            borderBottom: activeTab === 'likes' ? '3px solid #e85d75' : '3px solid transparent',
            background: 'transparent',
            position: 'relative'
          }}
        >
          ❤️ Likes
          {likes.length > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              background: '#e85d75',
              color: 'white',
              borderRadius: '100px',
              fontSize: '12px'
            }}>
              {likes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          style={{
            flex: 1,
            padding: '16px',
            fontWeight: 600,
            fontSize: '15px',
            color: activeTab === 'matches' ? '#e85d75' : '#8a8482',
            borderBottom: activeTab === 'matches' ? '3px solid #e85d75' : '3px solid transparent',
            background: 'transparent'
          }}
        >
          ✨ Matches
          {matches.length > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              background: '#4abe7a',
              color: 'white',
              borderRadius: '100px',
              fontSize: '12px'
            }}>
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'likes' ? (
          <LikesList 
            likes={likes} 
            onLikeBack={onLikeBack} 
            onRemove={onRemoveLike}
            onViewProfile={onViewProfile}
          />
        ) : (
          <MatchesList 
            matches={matches} 
            onScheduleChat={(match) => setScheduleModal(match)}
            onUnmatch={onUnmatch}
            onViewProfile={onViewProfile}
          />
        )}
      </div>

      {/* Schedule Chat Modal */}
      {scheduleModal && (
        <ScheduleChatModal
          match={scheduleModal}
          onSchedule={(time, duration) => {
            onScheduleChat(scheduleModal.userId, time, duration);
            setScheduleModal(null);
          }}
          onClose={() => setScheduleModal(null)}
        />
      )}
    </div>
  );
}

function LikesList({ likes, onLikeBack, onRemove, onViewProfile }) {
  if (likes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#8a8482'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💝</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No likes yet</p>
        <p style={{ fontSize: '14px' }}>When someone likes your profile, they'll appear here</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '8px' }}>
        These people are interested in you! Like them back to match.
      </p>
      {likes.map(like => (
        <LikeCard
          key={like.userId}
          like={like}
          onLikeBack={() => onLikeBack(like.userId)}
          onRemove={() => onRemove(like.userId)}
          onView={() => onViewProfile(like.profile)}
        />
      ))}
    </div>
  );
}

function LikeCard({ like, onLikeBack, onRemove, onView }) {
  const { profile, likedAt, isOnline } = like;
  const photo = profile.photos?.[0] || profile.photo;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.04)'
    }}>
      <div 
        onClick={onView}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '14px',
          background: `url(${photo}) center/cover`,
          flexShrink: 0,
          cursor: 'pointer',
          position: 'relative'
        }}
      >
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
          Liked you {formatTimeAgo(likedAt)}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onRemove}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#f5f2ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
        <button
          onClick={onLikeBack}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e85d75, #d94a62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(232, 93, 117, 0.3)'
          }}
        >
          ❤️
        </button>
      </div>
    </div>
  );
}

function MatchesList({ matches, onScheduleChat, onUnmatch, onViewProfile }) {
  if (matches.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#8a8482'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No matches yet</p>
        <p style={{ fontSize: '14px' }}>When you both like each other, you'll match!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '8px' }}>
        You both liked each other! Schedule a chat to connect.
      </p>
      {matches.map(match => (
        <MatchCard
          key={match.userId}
          match={match}
          onScheduleChat={() => onScheduleChat(match)}
          onUnmatch={() => onUnmatch(match.userId)}
          onView={() => onViewProfile(match.profile)}
        />
      ))}
    </div>
  );
}

function MatchCard({ match, onScheduleChat, onUnmatch, onView }) {
  const { profile, matchedAt, scheduledChat, isOnline } = match;
  const photo = profile.photos?.[0] || profile.photo;
  
  return (
    <div style={{
      padding: '16px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: scheduledChat ? '2px solid #4abe7a' : '1px solid rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div 
          onClick={onView}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '14px',
            background: `url(${photo}) center/cover`,
            flexShrink: 0,
            cursor: 'pointer',
            position: 'relative'
          }}
        >
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
            Matched {formatTimeAgo(matchedAt)}
          </p>
        </div>
      </div>

      {scheduledChat ? (
        <div style={{
          marginTop: '14px',
          padding: '12px',
          background: 'rgba(74, 190, 122, 0.1)',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#3a9d64' }}>
            📅 Chat scheduled
          </p>
          <p style={{ fontSize: '13px', color: '#5c5552', marginTop: '4px' }}>
            {new Date(scheduledChat.scheduledTime).toLocaleString()} • {scheduledChat.duration} min
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button
            onClick={onScheduleChat}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            📅 Schedule Chat
          </button>
          <button
            onClick={onUnmatch}
            style={{
              padding: '12px 16px',
              background: '#f5f2ef',
              color: '#8a8482',
              borderRadius: '12px',
              fontSize: '14px'
            }}
          >
            Unmatch
          </button>
        </div>
      )}
    </div>
  );
}

function ScheduleChatModal({ match, onSchedule, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && time) {
      const scheduledTime = new Date(`${date}T${time}`).getTime();
      onSchedule(scheduledTime, duration);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '28px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#2d2926' }}>
          Schedule a Chat
        </h2>
        <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '24px' }}>
          with {match.profile.name}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#5c5552', marginBottom: '8px' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #f0ebe7',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#5c5552', marginBottom: '8px' }}>
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #f0ebe7',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#5c5552', marginBottom: '8px' }}>
              Duration
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[3, 5, 10].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: duration === d ? '2px solid #e85d75' : '2px solid #f0ebe7',
                    background: duration === d ? 'rgba(232, 93, 117, 0.1)' : '#fff',
                    color: duration === d ? '#e85d75' : '#5c5552',
                    fontWeight: 600
                  }}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                background: '#f5f2ef',
                color: '#5c5552',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e85d75, #d94a62)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
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
