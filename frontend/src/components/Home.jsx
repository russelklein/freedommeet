import React from 'react';

export function Home({ 
  user, 
  isAdmin, 
  upcomingEvents,
  likesCount = 0,
  matchesCount = 0,
  viewsCount = 0,
  featuredProfiles = [],
  featuredGender = 'female',
  onFeaturedGenderChange,
  onViewFeaturedProfile,
  onJoinRoulette, 
  onViewRooms, 
  onViewEvents, 
  onViewAdmin,
  onViewDiscover,
  onViewConnections,
  onViewProfile,
  onViewInvite,
  onViewViews,
  onReportProblem,
  onSuggestFeature,
  onViewTerms,
  onViewPrivacy,
  onJoinEvent 
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 100%)',
      position: 'relative'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e85d75, #f4a261)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(232, 93, 117, 0.25)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px',
            fontWeight: 600,
            color: '#2d2926'
          }}>
            FreedomMeet
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdmin && (
            <button
              onClick={onViewAdmin}
              style={{
                padding: '8px 14px',
                background: 'rgba(232, 93, 117, 0.1)',
                borderRadius: '100px',
                color: '#e85d75',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📊</span> Admin
            </button>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px 6px 6px',
            background: '#fff',
            borderRadius: '100px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <img
              src={user.photos?.[0] || user.photo}
              alt={user.name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e85d75'
              }}
            />
            <button 
              onClick={onViewProfile}
              style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#2d2926',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {user.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8482" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '28px 20px'
      }}>
        {/* Welcome message */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: '6px',
            color: '#2d2926'
          }}>
            Hey {user.name.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#5c5552' }}>
            Ready to connect with your community?
          </p>
        </div>

        {/* Live Event Banner */}
        {upcomingEvents && upcomingEvents.length > 0 && upcomingEvents[0].status === 'live' && (
          <button
            onClick={() => onJoinEvent(upcomingEvents[0].id)}
            style={{
              width: '100%',
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #fef0f3, #fff5f0)',
              borderRadius: '16px',
              border: '2px solid #e85d75',
              marginBottom: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '4px 10px',
              background: '#e85d75',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'white',
                animation: 'pulse 1s infinite'
              }} />
              LIVE
            </div>
            
            <p style={{ color: '#e85d75', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              🎤 HAPPENING NOW
            </p>
            <p style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px', color: '#2d2926' }}>
              {upcomingEvents[0].title}
            </p>
            <p style={{ fontSize: '14px', color: '#5c5552' }}>
              {upcomingEvents[0].attendeeCount || 0} watching • Tap to join
            </p>
          </button>
        )}

        {/* Main Feature - Roulette */}
        <button
          onClick={onJoinRoulette}
          style={{
            width: '100%',
            padding: '32px 24px',
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.06)',
            marginBottom: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232, 93, 117, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(232, 93, 117, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(232, 93, 117, 0.1)';
          }}
        >
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px dashed rgba(232, 93, 117, 0.3)',
              animation: 'spin 10s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e85d75, #f4a261)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              boxShadow: '0 6px 20px rgba(232, 93, 117, 0.3)'
            }}>
              🎲
            </div>
          </div>
          
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '8px',
            color: '#2d2926'
          }}>
            3-Minute Roulette
          </h2>
          <p style={{
            color: '#5c5552',
            fontSize: '15px',
            marginBottom: '20px'
          }}>
            Quick chats with new people. Like each other? Keep talking! 💕
          </p>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #e85d75, #d94a62)',
            borderRadius: '100px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(232, 93, 117, 0.3)'
          }}>
            Find Someone
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Secondary Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <FeatureButton
            icon="🔍"
            title="Discover"
            subtitle="Browse profiles"
            color="#e85d75"
            onClick={onViewDiscover}
          />
          <FeatureButton
            icon="💝"
            title="Connections"
            subtitle="Likes & Matches"
            color="#f4a261"
            onClick={onViewConnections}
            badge={(likesCount + matchesCount) || null}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <FeatureButton
            icon="💬"
            title="Chat Rooms"
            subtitle="Join conversations"
            color="#4abe7a"
            onClick={onViewRooms}
          />
          <FeatureButton
            icon="🎤"
            title="Events"
            subtitle="Live talks"
            color="#9b8bba"
            onClick={onViewEvents}
            badge={upcomingEvents?.filter(e => e.status !== 'live').length || null}
          />
        </div>

        {/* Who Viewed Me & Invite */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <FeatureButton
            icon="👀"
            title="Who Viewed Me"
            subtitle="See visitors"
            color="#64b5f6"
            onClick={onViewViews}
            badge={viewsCount || null}
          />
          <FeatureButton
            icon="🎁"
            title="Invite Friends"
            subtitle="Grow community"
            color="#81c784"
            onClick={onViewInvite}
          />
        </div>

        {/* Featured Profiles - Multiple, clickable */}
        {featuredProfiles && featuredProfiles.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#8a8482',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⭐ Featured ({featuredProfiles.length})
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onFeaturedGenderChange?.('female')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: featuredGender === 'female' ? '#e85d75' : '#f5f2ef',
                    color: featuredGender === 'female' ? 'white' : '#8a8482'
                  }}
                >
                  👩 Women
                </button>
                <button
                  onClick={() => onFeaturedGenderChange?.('male')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: featuredGender === 'male' ? '#64b5f6' : '#f5f2ef',
                    color: featuredGender === 'male' ? 'white' : '#8a8482'
                  }}
                >
                  👨 Men
                </button>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              {featuredProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => onViewFeaturedProfile?.(profile)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    textAlign: 'center',
                    background: 'transparent'
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '14px',
                    background: `url(${profile.photos?.[0] || profile.photo}) center/cover`,
                    margin: '0 auto 6px',
                    border: profile.isOnline ? '3px solid #4abe7a' : 'none'
                  }} />
                  <p style={{ 
                    fontSize: '12px', 
                    fontWeight: 500, 
                    color: '#2d2926',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {profile.name}{profile.age ? `, ${profile.age}` : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.filter(e => e.status !== 'live').length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#8a8482',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '14px'
            }}>
              📅 Upcoming Events
            </h3>
            
            {upcomingEvents.filter(e => e.status !== 'live').slice(0, 2).map(event => (
              <button
                key={event.id}
                onClick={() => onJoinEvent(event.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  background: '#faf8f6',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f2ef'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#faf8f6'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(244, 162, 97, 0.15), rgba(232, 93, 117, 0.15))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  🎤
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600,
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#2d2926',
                    fontSize: '15px'
                  }}>
                    {event.title}
                  </p>
                  <p style={{ fontSize: '13px', color: '#8a8482' }}>
                    {new Date(event.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{
                  padding: '5px 10px',
                  background: 'rgba(74, 190, 122, 0.1)',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#3a9d64'
                }}>
                  {event.rsvpCount || 0}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* How it works */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          padding: '24px',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#5c5552'
          }}>
            How Roulette Works
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <Step icon="💬" text="Chat 3 min" />
            <Arrow />
            <Step icon="❤️" text="Like them" />
            <Arrow />
            <Step icon="✨" text="Match!" />
          </div>
        </div>

        {/* Feedback section */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingBottom: '20px'
        }}>
          <button
            onClick={onReportProblem}
            style={{
              padding: '10px 16px',
              background: '#f5f2ef',
              color: '#8a8482',
              borderRadius: '100px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚩 Report Problem
          </button>
          <button
            onClick={onSuggestFeature}
            style={{
              padding: '10px 16px',
              background: '#f5f2ef',
              color: '#8a8482',
              borderRadius: '100px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💡 Suggest Feature
          </button>
        </div>

        {/* Footer with legal links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '20px 0 40px'
        }}>
          <button
            onClick={onViewTerms}
            style={{
              color: '#b8a9ad',
              fontSize: '12px',
              background: 'transparent'
            }}
          >
            Terms of Service
          </button>
          <button
            onClick={onViewPrivacy}
            style={{
              color: '#b8a9ad',
              fontSize: '12px',
              background: 'transparent'
            }}
          >
            Privacy Policy
          </button>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function FeatureButton({ icon, title, subtitle, color, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '20px 16px',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#e85d75',
          color: 'white',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {badge}
        </div>
      )}
      
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        margin: '0 auto 12px'
      }}>
        {icon}
      </div>
      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px', color: '#2d2926' }}>{title}</p>
      <p style={{ fontSize: '13px', color: '#8a8482' }}>{subtitle}</p>
    </button>
  );
}

function Step({ icon, text }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#faf8f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 6px',
        fontSize: '20px'
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', color: '#8a8482' }}>{text}</p>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d0cbc8" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
