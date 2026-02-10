import React, { useState, useRef, useEffect } from 'react';
import { Timer } from './Timer';
import { ChatMessage } from './ChatMessage';
import { UserCard } from './UserCard';
import { VoiceInput } from './VoiceInput';

export function RouletteChat({ 
  match, 
  messages, 
  timer, 
  likeStatus,
  socketId,
  onSendMessage, 
  onLike, 
  onSkip 
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Find the other user
  const otherUserId = Object.keys(match.users).find(id => id !== socketId);
  const otherUser = match.users[otherUserId];
  const myUser = match.users[socketId];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(match.sessionId, inputValue);
      setInputValue('');
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100vh',
        background: 'var(--bg-secondary)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <UserCard user={otherUser} size="small" />
        </div>
        <Timer seconds={timer || 0} />
      </div>

      {/* Both users display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        padding: '24px',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)'
      }}>
        <UserCard user={myUser} size="medium" />
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <UserCard user={otherUser} size="medium" />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '20px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Say hello! You have 3 minutes.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOwn={msg.isOwn} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} style={{
        padding: '16px 20px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '14px 18px',
              fontSize: '15px',
              borderRadius: '12px',
              border: '2px solid #f0ebe7',
              background: '#faf8f6'
            }}
          />
          <VoiceInput onTranscript={(text) => setInputValue(prev => prev + text)} />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            style={{
              padding: '14px 24px',
              background: inputValue.trim() 
                ? 'linear-gradient(135deg, #e85d75, #c9485b)'
                : '#f5f2ef',
              borderRadius: '12px',
              color: inputValue.trim() ? 'white' : '#8a8482',
              fontWeight: 500
            }}
          >
            Send
          </button>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            type="button"
            onClick={() => onLike(match.sessionId)}
            disabled={likeStatus.liked}
            style={{
              flex: 1,
              maxWidth: '200px',
              padding: '14px 24px',
              background: likeStatus.liked 
                ? 'var(--bg-elevated)' 
                : 'linear-gradient(135deg, #e85d75, #f4a261)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: likeStatus.liked ? 'none' : 'var(--shadow-glow)'
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={likeStatus.liked ? 'var(--accent-primary)' : 'white'}
              style={{
                animation: likeStatus.liked ? 'heartbeat 1s ease-in-out' : 'none'
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeStatus.liked ? 'Liked!' : 'Like'}
          </button>

          <button
            type="button"
            onClick={() => onSkip(match.sessionId)}
            style={{
              flex: 1,
              maxWidth: '160px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #4abe7a, #3a9d64)',
              borderRadius: '100px',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(74, 190, 122, 0.3)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            Next
          </button>
        </div>

        {/* Leave button - separate row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '12px'
        }}>
          <button
            type="button"
            onClick={() => {
              if (confirm('Leave roulette? You will go back to the home screen.')) {
                window.location.reload();
              }
            }}
            style={{
              padding: '10px 24px',
              background: '#fee',
              borderRadius: '100px',
              color: '#e85d75',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            Leave Roulette
          </button>
        </div>

        {likeStatus.mutual && (
          <div 
            className="slide-up"
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(232, 93, 117, 0.2), rgba(244, 162, 97, 0.2))',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px solid var(--accent-primary)'
            }}
          >
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--accent-primary)'
            }}>
              ✨ It's a match! Starting private chat...
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
