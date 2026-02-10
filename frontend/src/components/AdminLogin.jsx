import React, { useState } from 'react';

export function AdminLogin({ onLogin, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const success = await onLogin(password);
    
    if (!success) {
      setError('Invalid password');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e85d75, #d94a62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            🔐
          </div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>
            Admin Access
          </h1>
          <p style={{ color: '#8a8a9a', fontSize: '14px', marginTop: '8px' }}>
            Authorized personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '2px solid #2a2a4a',
                background: '#1a1a2e',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(232, 93, 117, 0.2)',
              borderRadius: '8px',
              color: '#e85d75',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '14px',
              background: password ? 'linear-gradient(135deg, #e85d75, #d94a62)' : '#2a2a4a',
              color: password ? '#fff' : '#6a6a7a',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '16px',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#6a6a7a',
              fontSize: '14px'
            }}
          >
            ← Back to app
          </button>
        </form>
      </div>
    </div>
  );
}
