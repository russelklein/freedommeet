import React, { useState, useEffect } from 'react';

export function AdminDashboard({ 
  users = [],
  reports = [],
  flaggedUsers = [],
  rooms = [],
  stats = {},
  emails = [],
  onGetUsers,
  onGetReports,
  onGetStats,
  onExportEmails,
  onDeleteUser,
  onBack 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    onGetUsers?.();
    onGetReports?.();
    onGetStats?.();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = rooms.reduce((sum, r) => sum + (r.memberCount || 0), 0);
  const globalStats = stats.global || {};

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
          Admin Dashboard
        </h1>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        overflowX: 'auto'
      }}>
        {['overview', 'stats', 'users', 'reports', 'emails'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'emails') onExportEmails?.();
            }}
            style={{
              padding: '14px 16px',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === tab ? '#e85d75' : '#8a8482',
              borderBottom: activeTab === tab ? '3px solid #e85d75' : '3px solid transparent',
              background: 'transparent',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {tab}
            {tab === 'flagged' && flaggedUsers.length > 0 && (
              <span style={{
                marginLeft: '6px',
                padding: '2px 6px',
                background: '#e85d75',
                color: 'white',
                borderRadius: '100px',
                fontSize: '11px'
              }}>
                {flaggedUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'overview' && (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
              Current Activity
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <StatCard icon="👥" label="Active Users" value={users.length} />
              <StatCard icon="💬" label="In Rooms" value={totalMembers} />
              <StatCard icon="🚩" label="Pending Reports" value={reports.length} />
              <StatCard icon="⚠️" label="Flagged Users" value={flaggedUsers.length} color="#e85d75" />
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
              Flagged Users (10+ Reports)
            </h2>
            {flaggedUsers.length === 0 ? (
              <p style={{ color: '#8a8482', padding: '20px', textAlign: 'center' }}>No flagged users</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {flaggedUsers.map(item => (
                  <UserCard 
                    key={item.userId} 
                    user={item.profile} 
                    reportCount={item.reportCount}
                    onDelete={() => onDeleteUser?.(item.userId)}
                    flagged
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
              Lifetime Stats (Never Deleted)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <StatCard icon="📝" label="Total Signups" value={globalStats.totalSignups || 0} color="#4abe7a" />
              <StatCard icon="💕" label="Total Matches" value={globalStats.totalMatches || 0} color="#e85d75" />
              <StatCard icon="❤️" label="Total Likes" value={globalStats.totalLikes || 0} color="#f4a261" />
              <StatCard icon="💬" label="Total Messages" value={globalStats.totalMessages || 0} color="#64b5f6" />
              <StatCard icon="🎰" label="Roulette Sessions" value={globalStats.totalRouletteSessions || 0} color="#9b8bba" />
              <StatCard icon="👀" label="Profile Views" value={globalStats.totalProfileViews || 0} color="#81c784" />
              <StatCard icon="📧" label="Emails Collected" value={stats.emailCount || 0} color="#4abe7a" />
              <StatCard icon="🏆" label="Peak Users" value={globalStats.peakConcurrentUsers || 0} color="#ffd54f" />
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#2d2926' }}>
              Gender Breakdown
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <StatCard icon="👨" label="Male Signups" value={globalStats.maleSignups || 0} color="#64b5f6" />
              <StatCard icon="👩" label="Female Signups" value={globalStats.femaleSignups || 0} color="#f48fb1" />
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #f0ebe7',
                fontSize: '15px',
                marginBottom: '16px',
                background: '#fff'
              }}
            />
            <p style={{ fontSize: '13px', color: '#8a8482', marginBottom: '12px' }}>
              Showing {filteredUsers.length} active users
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUsers.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  reportCount={user.reportCount}
                  onDelete={() => onDeleteUser?.(user.id)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8a8482', padding: '40px' }}>No reports</p>
            ) : (
              reports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#2d2926' }}>
                  Email List
                </h2>
                <p style={{ fontSize: '13px', color: '#8a8482' }}>
                  {emails.length} emails collected
                </p>
              </div>
              <button
                onClick={() => {
                  const csv = emails.map(e => `${e.email},"${e.name}","${e.city}"`).join('\n');
                  const blob = new Blob(['email,name,city\n' + csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'freedommeet_emails.csv';
                  a.click();
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #4abe7a, #3a9d64)',
                  color: 'white',
                  borderRadius: '100px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Download CSV
              </button>
            </div>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.06)'
            }}>
              {emails.slice(0, 50).map((email, i) => (
                <div 
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 500, color: '#2d2926' }}>{email.email}</p>
                    <p style={{ fontSize: '12px', color: '#8a8482' }}>{email.name} • {email.city}</p>
                  </div>
                  <p style={{ fontSize: '11px', color: '#b8a9ad' }}>
                    {new Date(email.addedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {emails.length > 50 && (
                <p style={{ padding: '12px', textAlign: 'center', color: '#8a8482', fontSize: '13px' }}>
                  +{emails.length - 50} more (download CSV for full list)
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color = '#2d2926' }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '28px', fontWeight: 700, color }}>{value.toLocaleString()}</p>
      <p style={{ fontSize: '13px', color: '#8a8482' }}>{label}</p>
    </div>
  );
}

function UserCard({ user, reportCount = 0, onDelete, flagged }) {
  const photo = user.photos?.[0] || user.photo;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: flagged ? 'rgba(232, 93, 117, 0.05)' : '#fff',
      borderRadius: '12px',
      border: flagged ? '1px solid rgba(232, 93, 117, 0.3)' : '1px solid rgba(0,0,0,0.04)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '10px',
        background: photo ? `url(${photo}) center/cover` : '#f5f2ef',
        flexShrink: 0
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '15px', color: '#2d2926' }}>
          {user.name}{user.age ? `, ${user.age}` : ''}
          {user.gender && <span style={{ color: '#8a8482', fontWeight: 400 }}> ({user.gender})</span>}
        </p>
        <p style={{ fontSize: '12px', color: '#8a8482' }}>
          {user.city || 'No location'} • {user.photos?.length || 0} photos
        </p>
        {reportCount > 0 && (
          <p style={{ fontSize: '12px', color: '#e85d75', marginTop: '2px' }}>
            ⚠️ {reportCount} report{reportCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        style={{
          padding: '8px 12px',
          background: '#fee',
          color: '#e85d75',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        Delete
      </button>
    </div>
  );
}

function ReportCard({ report }) {
  return (
    <div style={{
      padding: '14px',
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontSize: '14px', color: '#2d2926' }}>
          <strong>{report.reporterName}</strong> reported <strong>{report.reportedName}</strong>
        </p>
        <p style={{ fontSize: '12px', color: '#8a8482' }}>
          {new Date(report.timestamp).toLocaleDateString()}
        </p>
      </div>
      <p style={{
        fontSize: '13px',
        color: '#5c5552',
        padding: '10px',
        background: '#faf8f6',
        borderRadius: '8px'
      }}>
        {report.reason}
      </p>
    </div>
  );
}
