import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ProfileModal } from './ProfileModal';
import { VoiceInput } from './VoiceInput';

export function RoomChat({ 
  room, 
  messages, 
  socketId,
  onSendMessage, 
  onLeave,
  onKickUser,
  onBanUser,
  onDeleteRoom,
  onUpdateProfile
}) {
  const [inputValue, setInputValue] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [mobileView, setMobileView] = useState('chat'); // 'chat' or 'members'
  const [showModMenu, setShowModMenu] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCreator = room.creatorId === socketId;
  const isModerator = isCreator || (!room.isDefault && room.creatorId === socketId);
  const currentUser = room.members?.find(m => m.id === socketId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(room.id, inputValue);
      setInputValue('');
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#faf8f6'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onLeave}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: '#f5f2ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c5552" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {room.icon}
          </div>
          
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>
              {room.name}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {room.memberCount || 0} people here
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onLeave}
            style={{
              padding: '8px 14px',
              borderRadius: '100px',
              background: '#fee',
              color: '#e85d75',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Leave
          </button>
          
          {/* Mobile toggle */}
          {isMobile ? (
            <div style={{ display: 'flex', background: '#f5f2ef', borderRadius: '100px', padding: '3px' }}>
              <button
                onClick={() => setMobileView('chat')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: mobileView === 'chat' ? '#fff' : 'transparent',
                  color: mobileView === 'chat' ? '#2d2926' : '#8a8482',
                  boxShadow: mobileView === 'chat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMobileView('members')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: mobileView === 'members' ? '#fff' : 'transparent',
                  color: mobileView === 'members' ? '#2d2926' : '#8a8482',
                  boxShadow: mobileView === 'members' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                👥 {room.members?.length || 0}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMembers(!showMembers)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: showMembers ? '#e85d75' : '#f5f2ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showMembers ? 'white' : '#5c5552'} strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
          )}

          {isCreator && !room.isDefault && (
            <button
              onClick={() => {
                if (confirm('Delete this room?')) onDeleteRoom(room.id);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#f5f2ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e85d75" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Members sidebar - show based on mobile/desktop */}
        {(isMobile ? mobileView === 'members' : showMembers) && (
          <div style={{
            width: isMobile ? '100%' : '280px',
            background: '#fff',
            borderRight: isMobile ? 'none' : '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#8a8482',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                People Here ({room.members?.length || 0})
              </h3>
            </div>

            {/* Member grid/gallery */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                {room.members?.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === socketId}
                    isCreator={member.id === room.creatorId}
                    isModerator={isModerator}
                    onClick={() => setSelectedProfile(member)}
                    onKick={() => onKickUser(room.id, member.id)}
                    onBan={() => onBanUser(room.id, member.id)}
                  />
                ))}
              </div>

              {(!room.members || room.members.length === 0) && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#8a8482'
                }}>
                  <p>No one here yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat area - hide on mobile when viewing members */}
        {(!isMobile || mobileView === 'chat') && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '16px'
                }}>
                  {room.icon}
                </div>
                <p style={{ fontSize: '15px', marginBottom: '4px' }}>
                  Welcome to {room.name}!
                </p>
                <p style={{ fontSize: '13px' }}>
                  Start the conversation
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const member = room.members?.find(m => m.id === msg.from);
                    if (member) setSelectedProfile(member);
                  }}
                >
                  <ChatMessage message={msg} isOwn={msg.isOwn} />
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '12px 16px',
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
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
                padding: '12px 20px',
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
          </form>
        </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          user={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          isOwnProfile={selectedProfile.id === socketId}
          onUpdateProfile={onUpdateProfile}
        />
      )}
    </div>
  );
}

// Member card for the sidebar gallery - compact version
function MemberCard({ member, isCurrentUser, isCreator, isModerator, onClick, onKick, onBan }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f5f2ef',
        cursor: 'pointer'
      }}
    >
      {/* Photo - square, small */}
      <div style={{ aspectRatio: '1', position: 'relative' }}>
        <img
          src={member.photo}
          alt={member.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Online dot */}
        <div style={{
          position: 'absolute',
          bottom: '3px',
          right: '3px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#4abe7a',
          border: '1.5px solid #fff'
        }} />

        {/* Creator badge */}
        {isCreator && (
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            padding: '1px 4px',
            background: '#e85d75',
            borderRadius: '4px',
            fontSize: '8px',
            fontWeight: 700,
            color: 'white'
          }}>
            MOD
          </div>
        )}
      </div>

      {/* Name - small */}
      <div style={{ padding: '4px' }}>
        <p style={{
          fontSize: '10px',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          color: '#2d2926'
        }}>
          {member.name}
          {isCurrentUser && <span style={{ color: '#8a8482' }}> •</span>}
        </p>
      </div>
    </div>
  );
}
