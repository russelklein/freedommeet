import React, { useState, useRef, useEffect } from 'react';

export function EventRoom({
  event,
  messages,
  questions,
  attendees,
  socketId,
  isAdmin,
  onSendMessage,
  onSubmitQuestion,
  onUpvoteQuestion,
  onUpdateQuestionStatus,
  onStartEvent,
  onEndEvent,
  onLeave
}) {
  const [inputValue, setInputValue] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showAttendees, setShowAttendees] = useState(false);
  const messagesEndRef = useRef(null);

  const isHost = event.creatorId === socketId || isAdmin;
  const isLive = event.status === 'live';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(event.id, inputValue);
      setInputValue('');
    }
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (questionInput.trim()) {
      onSubmitQuestion(event.id, questionInput);
      setQuestionInput('');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.length === 11 && !url.includes('/')) {
      return `https://www.youtube.com/embed/${url}?autoplay=1`;
    }
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = event.videoType === 'youtube' ? getYouTubeEmbedUrl(event.videoUrl) : null;
  const pendingQuestions = questions.filter(q => q.status === 'pending' || q.status === 'approved');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onLeave} style={{
            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLive && (
                <span style={{ padding: '2px 8px', background: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 700, color: 'white' }}>LIVE</span>
              )}
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{event.title}</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {event.speakerName && `with ${event.speakerName} • `}{attendees.length} watching
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAttendees(!showAttendees)} style={{
            padding: '8px 12px', background: showAttendees ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)', color: showAttendees ? 'white' : 'var(--text-secondary)', fontSize: '13px'
          }}>👥 {attendees.length}</button>
          {isHost && !isLive && event.status === 'scheduled' && (
            <button onClick={() => onStartEvent(event.id)} style={{
              padding: '8px 16px', background: 'var(--success)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, fontSize: '13px'
            }}>Start Event</button>
          )}
          {isHost && isLive && (
            <button onClick={() => onEndEvent(event.id)} style={{
              padding: '8px 16px', background: 'var(--error)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, fontSize: '13px'
            }}>End Event</button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLive && embedUrl ? (
              <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : isLive && event.videoType === 'zoom' && event.videoUrl ? (
              <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>This event is on Zoom</h3>
                <a href={event.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', padding: '16px 32px', background: '#2D8CFF', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600
                }}>Join Zoom Meeting</a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>
                  {isLive ? '🎬' : '⏳'}
                </div>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {isLive ? 'Stream starting soon...' : 'Event not started yet'}
                </h3>
                <p style={{ fontSize: '14px' }}>
                  {isLive ? 'The host is setting up the stream' : `Scheduled for ${new Date(event.scheduledAt).toLocaleString()}`}
                </p>
              </div>
            )}
          </div>
          {/* Speaker info */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {event.speakerPhoto && <img src={event.speakerPhoto} alt={event.speakerName} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />}
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{event.speakerName || 'Speaker'}</p>
              {event.speakerBio && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{event.speakerBio.slice(0, 100)}{event.speakerBio.length > 100 ? '...' : ''}</p>}
            </div>
          </div>
        </div>

        {/* Chat/Q&A Sidebar */}
        <div style={{ width: '360px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setActiveTab('chat')} style={{
              flex: 1, padding: '14px', background: activeTab === 'chat' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '13px',
              borderBottom: activeTab === 'chat' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}>💬 Chat</button>
            <button onClick={() => setActiveTab('qa')} style={{
              flex: 1, padding: '14px', background: activeTab === 'qa' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'qa' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '13px',
              borderBottom: activeTab === 'qa' ? '2px solid var(--accent-primary)' : '2px solid transparent', position: 'relative'
            }}>
              ❓ Q&A
              {pendingQuestions.length > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '20px', width: '18px', height: '18px', borderRadius: 'var(--radius-full)', background: 'var(--accent-primary)', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{pendingQuestions.length}</span>
              )}
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
                    <p>No messages yet</p>
                  </div>
                ) : messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                    <img src={msg.senderPhoto} alt="" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: msg.isOwn ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{msg.senderName}</span>
                      <p style={{ fontSize: '14px', marginTop: '2px' }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Send a message..." style={{ flex: 1, padding: '10px 12px', fontSize: '14px' }} />
                <button type="submit" disabled={!inputValue.trim()} style={{ padding: '10px 16px', background: inputValue.trim() ? 'var(--accent-primary)' : 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 500 }}>Send</button>
              </form>
            </>
          )}

          {/* Q&A Panel */}
          {activeTab === 'qa' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <form onSubmit={handleSubmitQuestion} style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <textarea value={questionInput} onChange={(e) => setQuestionInput(e.target.value)} placeholder="Ask a question..." rows={2} maxLength={500} style={{ width: '100%', padding: '10px', fontSize: '14px', resize: 'none', marginBottom: '8px' }} />
                <button type="submit" disabled={!questionInput.trim()} style={{ width: '100%', padding: '10px', background: questionInput.trim() ? 'var(--accent-primary)' : 'var(--bg-card)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, fontSize: '13px' }}>✋ Submit Question</button>
              </form>
              {pendingQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} isHost={isHost} socketId={socketId}
                  onUpvote={() => onUpvoteQuestion(event.id, q.id)}
                  onAnswer={() => onUpdateQuestionStatus(event.id, q.id, 'answered')}
                  onDismiss={() => onUpdateQuestionStatus(event.id, q.id, 'dismissed')} />
              ))}
              {answeredQuestions.length > 0 && (
                <>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '16px 0 8px' }}>Answered</h4>
                  {answeredQuestions.map((q) => <QuestionCard key={q.id} question={q} isAnswered />)}
                </>
              )}
            </div>
          )}
        </div>

        {/* Attendees sidebar */}
        {showAttendees && (
          <div style={{ width: '200px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '12px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Watching ({attendees.length})</h4>
            {attendees.map((user) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)' }}>
                <img src={user.photo} alt="" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
                <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, isHost, socketId, isAnswered, onUpvote, onAnswer, onDismiss }) {
  const hasUpvoted = question.upvoters?.includes(socketId);
  return (
    <div style={{ padding: '12px', background: isAnswered ? 'rgba(110,207,142,0.1)' : 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
        <img src={question.askerPhoto} alt="" style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{question.askerName}</span>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>{question.text}</p>
        </div>
      </div>
      {!isAnswered && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onUpvote} disabled={hasUpvoted} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: hasUpvoted ? 'var(--accent-primary)' : 'transparent', borderRadius: 'var(--radius-full)', color: hasUpvoted ? 'white' : 'var(--text-muted)', fontSize: '13px' }}>👍 {question.upvotes || 0}</button>
          {isHost && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={onAnswer} style={{ padding: '6px 10px', background: 'var(--success)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '11px', fontWeight: 600 }}>Answered</button>
              <button onClick={onDismiss} style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '11px' }}>✕</button>
            </div>
          )}
        </div>
      )}
      {isAnswered && <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>✓ Answered</div>}
    </div>
  );
}
