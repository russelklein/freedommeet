import React, { useState } from 'react';

export function InviteFriends({ userId, inviteCount = 0, onBack }) {
  const [copied, setCopied] = useState(false);
  
  const inviteLink = `${window.location.origin}?ref=${userId}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}&quote=${encodeURIComponent("Join me on FreedomMeet - a dating community for free thinkers! 💕")}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

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
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>
          Invite Friends
        </h1>
      </header>

      <div style={{ padding: '24px 20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{
          background: 'linear-gradient(135deg, #e85d75, #f4a261)',
          borderRadius: '20px',
          padding: '28px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Friends Invited</p>
          <p style={{ fontSize: '48px', fontWeight: 700 }}>{inviteCount}</p>
        </div>

        {/* Why Invite */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
            Why invite friends?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>👥</span>
              <p style={{ color: '#5c5552', fontSize: '15px' }}>More people = more matches for everyone</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>💕</span>
              <p style={{ color: '#5c5552', fontSize: '15px' }}>Help your single friends find love</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🌟</span>
              <p style={{ color: '#5c5552', fontSize: '15px' }}>Build our freedom-minded community</p>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
            Your invite link
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              value={inviteLink}
              readOnly
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '12px',
                border: '2px solid #f0ebe7',
                fontSize: '14px',
                background: '#faf8f6',
                color: '#5c5552'
              }}
            />
            <button
              onClick={copyLink}
              style={{
                padding: '14px 20px',
                background: copied ? '#4abe7a' : 'linear-gradient(135deg, #e85d75, #d94a62)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={shareOnFacebook}
            style={{
              width: '100%',
              padding: '14px',
              background: '#1877f2',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </button>
        </div>

        {/* Message to share */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
            Copy & paste message
          </h2>
          <div style={{
            background: '#faf8f6',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <p style={{ color: '#5c5552', fontSize: '14px', lineHeight: 1.6 }}>
              Hey! 👋 I found this great dating community for freedom-minded people. 
              No algorithms, no games - just real conversations with like-minded singles. 
              Join me here: {inviteLink}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`Hey! 👋 I found this great dating community for freedom-minded people. No algorithms, no games - just real conversations with like-minded singles. Join me here: ${inviteLink}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: '#f5f2ef',
              color: '#5c5552',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Copy Message
          </button>
        </div>
      </div>
    </div>
  );
}
