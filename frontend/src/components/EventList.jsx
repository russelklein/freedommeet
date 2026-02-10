import React, { useState } from 'react';

export function EventList({ 
  events, 
  isAdmin, 
  onJoinEvent, 
  onCreateEvent, 
  onRsvp, 
  onCancelRsvp,
  onDeleteEvent,
  onBack 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    speakerName: '',
    speakerBio: '',
    videoUrl: '',
    videoType: 'youtube',
    scheduledAt: '',
    duration: 60
  });

  const now = Date.now();
  const liveEvents = events.filter(e => e.status === 'live');
  const upcomingEvents = events.filter(e => e.status === 'scheduled' && e.scheduledAt > now);
  const pastEvents = events.filter(e => e.status === 'ended' || (e.status === 'scheduled' && e.scheduledAt <= now));

  const handleCreate = (e) => {
    e.preventDefault();
    if (newEvent.title.trim() && newEvent.scheduledAt) {
      onCreateEvent({
        ...newEvent,
        scheduledAt: new Date(newEvent.scheduledAt).getTime()
      });
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        speakerName: '',
        speakerBio: '',
        videoUrl: '',
        videoType: 'youtube',
        scheduledAt: '',
        duration: 60
      });
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--bg-primary) 0%, #1a1215 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(36, 32, 34, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600
            }}>
              🎤 Events
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Live talks & Q&A sessions
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Event
          </button>
        )}
      </header>

      {/* Event list */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {/* Live Now */}
          {liveEvents.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--error)',
                  animation: 'pulse 1.5s infinite'
                }} />
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--error)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Live Now
                </h2>
              </div>
              
              {liveEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  isLive={true}
                  isAdmin={isAdmin}
                  onJoin={() => onJoinEvent(event.id)}
                  onRsvp={() => onRsvp(event.id)}
                  onCancelRsvp={() => onCancelRsvp(event.id)}
                  onDelete={() => onDeleteEvent(event.id)}
                />
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '4px',
                height: '20px',
                background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '2px'
              }} />
              <h2 style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Upcoming Events
              </h2>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingEvents.map(event => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    isAdmin={isAdmin}
                    onJoin={() => onJoinEvent(event.id)}
                    onRsvp={() => onRsvp(event.id)}
                    onCancelRsvp={() => onCancelRsvp(event.id)}
                    onDelete={() => onDeleteEvent(event.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '2px dashed var(--border-subtle)'
              }}>
                <p style={{ color: 'var(--text-muted)' }}>No upcoming events</p>
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '4px',
                  height: '20px',
                  background: 'var(--text-muted)',
                  borderRadius: '2px'
                }} />
                <h2 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Past Events
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.7 }}>
                {pastEvents.slice(0, 5).map(event => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    isPast={true}
                    isAdmin={isAdmin}
                    onDelete={() => onDeleteEvent(event.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="slide-up"
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              marginBottom: '24px'
            }}>
              Create Event
            </h2>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Dating After 40: Tips & Stories"
                  maxLength={100}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="What will this event cover?"
                  maxLength={1000}
                  rows={3}
                  style={{ resize: 'none', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Speaker Name</label>
                  <input
                    type="text"
                    value={newEvent.speakerName}
                    onChange={(e) => setNewEvent({ ...newEvent, speakerName: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) || 60 })}
                    min={15}
                    max={180}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Speaker Bio</label>
                <textarea
                  value={newEvent.speakerBio}
                  onChange={(e) => setNewEvent({ ...newEvent, speakerBio: e.target.value })}
                  placeholder="Brief background about the speaker..."
                  maxLength={500}
                  rows={2}
                  style={{ resize: 'none', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newEvent.scheduledAt}
                  onChange={(e) => setNewEvent({ ...newEvent, scheduledAt: e.target.value })}
                  required
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Video Type</label>
                <select
                  value={newEvent.videoType}
                  onChange={(e) => setNewEvent({ ...newEvent, videoType: e.target.value })}
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="youtube">YouTube Live</option>
                  <option value="zoom">Zoom</option>
                  <option value="custom">Other URL</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                  {newEvent.videoType === 'youtube' ? 'YouTube Video ID or URL' : 
                   newEvent.videoType === 'zoom' ? 'Zoom Meeting Link' : 'Video URL'}
                </label>
                <input
                  type="text"
                  value={newEvent.videoUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, videoUrl: e.target.value })}
                  placeholder={
                    newEvent.videoType === 'youtube' ? 'dQw4w9WgXcQ or full YouTube URL' :
                    newEvent.videoType === 'zoom' ? 'https://zoom.us/j/...' : 'https://...'
                  }
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  You can add this later before the event starts
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newEvent.title.trim() || !newEvent.scheduledAt}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: (newEvent.title.trim() && newEvent.scheduledAt)
                      ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                      : 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px'
};

function EventCard({ event, isLive, isPast, isAdmin, onJoin, onRsvp, onCancelRsvp, onDelete, formatDate }) {
  const date = formatDate ? formatDate(event.scheduledAt) : '';
  
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: isLive ? '2px solid var(--error)' : '1px solid var(--border-subtle)',
      overflow: 'hidden',
      transition: 'all 0.2s'
    }}>
      {isLive && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--error)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            background: 'white',
            animation: 'pulse 1s infinite'
          }} />
          LIVE NOW • {event.attendeeCount || 0} watching
        </div>
      )}
      
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Speaker photo */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {event.speakerPhoto ? (
              <img 
                src={event.speakerPhoto} 
                alt={event.speakerName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🎤
              </div>
            )}
          </div>

          {/* Event info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              {event.title}
            </h3>
            
            {event.speakerName && (
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                with {event.speakerName}
              </p>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              {!isLive && date && (
                <span>📅 {date}</span>
              )}
              <span>⏱ {event.duration} min</span>
              <span>👥 {event.rsvpCount || 0} RSVPs</span>
            </div>
          </div>
        </div>

        {event.description && (
          <p style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {event.description.slice(0, 150)}
            {event.description.length > 150 ? '...' : ''}
          </p>
        )}

        {/* Actions */}
        {!isPast && (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {isLive ? (
              <button
                onClick={onJoin}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--error)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Join Live
              </button>
            ) : (
              <>
                {event.hasRsvp ? (
                  <button
                    onClick={onCancelRsvp}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    ✓ RSVP'd - Cancel
                  </button>
                ) : (
                  <button
                    onClick={onRsvp}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      borderRadius: 'var(--radius-md)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  >
                    RSVP
                  </button>
                )}
              </>
            )}
            
            {isAdmin && (
              <button
                onClick={onDelete}
                style={{
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--error)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}

        {isPast && event.stats && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            Peak attendance: {event.stats.peakAttendees || 0} • 
            Questions: {event.stats.totalQuestions || 0}
          </div>
        )}
      </div>
    </div>
  );
}
