import React, { useState, useRef, useEffect } from 'react';
import { Timer } from './Timer';
import { ChatMessage } from './ChatMessage';
import { UserCard } from './UserCard';
import { VoiceInput } from './VoiceInput';

export function PrivateChat({ 
  chat, 
  messages, 
  timer, 
  extendStatus,
  socketId,
  onSendMessage, 
  onExtend, 
  onLeave 
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Find the other user
  const otherUserId = Object.keys(chat.users).find(id => id !== socketId);
  const otherUser = chat.users[otherUserId];

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
      onSendMessage(chat.chatId, inputValue);
      setInputValue('');
    }
  };

  const showExtendPrompt = timer !== null && timer <= 60;

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
        background: 'linear-gradient(135deg, var(--accent-primary), #c9485b)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'white'
          }}>
            ✨ Matched!
          </div>
          <span style={{ color: 'white', fontWeight: 500 }}>
            Private Chat with {otherUser.name}
          </span>
        </div>
        <Timer seconds={timer || 0} warning={60} />
      </div>

      {/* Other user display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <UserCard user={otherUser} size="large" />
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
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(232, 93, 117, 0.2), rgba(244, 162, 97, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-primary)">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', marginBottom: '4px' }}>
              You both liked each other!
            </p>
            <p style={{ fontSize: '14px' }}>
              Start a conversation...
            </p>
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

      {/* Extend prompt */}
      {showExtendPrompt && (
        <div 
          className="slide-up"
          style={{
            margin: '0 20px',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(244, 162, 97, 0.2), rgba(232, 93, 117, 0.2))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <p style={{ 
              fontWeight: 600, 
              color: 'var(--warning)',
              marginBottom: '4px'
            }}>
              Time running out!
            </p>
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-secondary)'
            }}>
              {extendStatus.voted 
                ? 'Waiting for them to extend...'
                : extendStatus.votedCount > 0
                  ? 'They want to keep chatting!'
                  : 'Both must click extend to continue'
              }
            </p>
          </div>
          <button
            onClick={() => onExtend(chat.chatId)}
            disabled={extendStatus.voted}
            style={{
              padding: '10px 20px',
              background: extendStatus.voted 
                ? 'var(--bg-elevated)' 
                : 'linear-gradient(135deg, var(--warning), var(--accent-primary))',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {extendStatus.voted ? '✓ Extended' : 'Extend +5min'}
          </button>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} style={{
        padding: '16px 20px',
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px'
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

        <button
          type="button"
          onClick={() => onLeave(chat.chatId)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--error)';
            e.target.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.color = 'var(--text-muted)';
          }}
        >
          Leave Chat
        </button>
      </form>
    </div>
  );
}
