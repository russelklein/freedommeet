import React, { useState } from 'react';

const ADMIN_PASSWORD = 'FreedomAdmin2024!';

export function AdminLogin({ onSuccess, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('freedommeet_admin', 'true');
      onSuccess();
    } else {
      setError('Invalid password');
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
        </div>

        <form onSubmit={handleSubmit}>
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
              fontSize: '16px',
              marginBottom: '20px'
            }}
          />

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(232, 93, 117, 0.2)',
              borderRadius: '8px',
              color: '#e85d75',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
