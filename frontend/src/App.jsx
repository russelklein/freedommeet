import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Queue } from './components/Queue';
import { RouletteChat } from './components/RouletteChat';
import { PrivateChat } from './components/PrivateChat';
import { RoomList } from './components/RoomList';
import { RoomChat } from './components/RoomChat';
import { EventList } from './components/EventList';
import { EventRoom } from './components/EventRoom';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ProfileBrowser } from './components/ProfileBrowser';
import { LikesAndMatches } from './components/LikesAndMatches';
import { MyProfile } from './components/MyProfile';
import { InviteFriends } from './components/InviteFriends';
import { WhoViewedMe } from './components/WhoViewedMe';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';

function App() {
  const [view, setView] = useState(() => {
    // Check for secret admin URL
    if (window.location.pathname === '/fm-admin-2024') {
      // Check if already logged in as admin
      if (localStorage.getItem('freedommeet_admin') === 'true') {
        return 'admin';
      }
      return 'admin-login';
    }
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('freedommeet_user');
    return savedUser ? 'home' : 'landing';
  });
  const [showLogin, setShowLogin] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [hasAutoRegistered, setHasAutoRegistered] = useState(false);
  const [featuredGender, setFeaturedGender] = useState('female');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  
  // Check if admin from localStorage
  const [isAdminLocal, setIsAdminLocal] = useState(() => {
    return localStorage.getItem('freedommeet_admin') === 'true';
  });
  
  const {
    isConnected,
    user,
    queueStatus,
    currentMatch,
    privateChat,
    messages,
    timer,
    error,
    likeStatus,
    extendStatus,
    socketId,
    register,
    joinQueue,
    leaveQueue,
    sendRouletteMessage,
    like,
    skip,
    sendPrivateMessage,
    extend,
    leavePrivate,
    clearError,
    // Room state
    rooms,
    currentRoom,
    roomMessages,
    // Room actions
    getRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    kickUser,
    banUser,
    deleteRoom,
    // Admin
    isAdmin,
    updateRoom,
    createDefaultRoom,
    checkAdmin,
    adminLogin,
    // Profile
    updateProfile,
    // Event state
    events,
    upcomingEvents,
    currentEvent,
    eventMessages,
    eventQuestions,
    eventAttendees,
    // Event actions
    getEvents,
    getUpcomingEvents,
    createEvent,
    deleteEvent,
    rsvpEvent,
    cancelRsvp,
    startEvent,
    endEvent,
    joinEvent,
    leaveEvent,
    sendEventMessage,
    submitQuestion,
    upvoteQuestion,
    updateQuestionStatus,
    getEventStats,
    // Profile discovery
    browseProfiles,
    likesReceived,
    matches,
    profileViews,
    featuredProfiles,
    inviteCount,
    loadProfiles,
    likeProfile,
    getLikes,
    removeLike,
    likeBack,
    getMatches,
    unmatch,
    scheduleChat,
    viewProfile,
    getProfileViews,
    getFeaturedProfiles,
    reportUser,
    deleteMyProfile,
    getInviteCount,
    // Admin
    adminUsers,
    adminReports,
    flaggedUsers,
    adminStats,
    adminEmails,
    adminGetUsers,
    adminGetReports,
    adminDeleteUser,
    adminGetStats,
    adminExportEmails
  } = useSocket();

  // Auto-register from localStorage on connect
  useEffect(() => {
    if (isConnected && !user && !hasAutoRegistered) {
      const savedUser = localStorage.getItem('freedommeet_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Generate or reuse a persistent user ID
          if (!userData.persistentId) {
            userData.persistentId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('freedommeet_user', JSON.stringify(userData));
          }
          register(userData);
          setHasAutoRegistered(true);
          setView('home');
        } catch (e) {
          localStorage.removeItem('freedommeet_user');
        }
      }
    }
  }, [isConnected, user, hasAutoRegistered]);

  // Handle registration - save to localStorage
  const handleRegister = (data) => {
    // Generate a persistent user ID for new registrations
    const userData = {
      ...data,
      persistentId: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem('freedommeet_user', JSON.stringify(userData));
    register(userData);
    setShowLogin(false);
    setView('home');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('freedommeet_user');
    window.location.reload();
  };

  // Load data based on view
  useEffect(() => {
    // Admin view works without user
    if (view === 'admin' && isAdminLocal) {
      adminGetUsers();
      adminGetReports();
      adminGetStats();
      return;
    }
    
    if (!user) return;
    
    // Always check admin status when user is logged in
    checkAdmin();
    
    if (view === 'rooms') {
      getRooms();
    } else if (view === 'events') {
      getEvents(false);
    } else if (view === 'admin') {
      getRooms();
      getEvents(true);
      adminGetUsers();
      adminGetReports();
    } else if (view === 'home') {
      getUpcomingEvents(3);
      getFeaturedProfiles(featuredGender);
      getInviteCount();
      getProfileViews();
    } else if (view === 'discover') {
      loadProfiles();
    } else if (view === 'connections') {
      getLikes();
      getMatches();
    }
  }, [view, user, isAdminLocal]);

  // Error toast
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div 
        className="slide-up"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--error)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000
        }}
      >
        <span>{error}</span>
        <button
          onClick={clearError}
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            color: 'white',
            fontSize: '12px'
          }}
        >
          Dismiss
        </button>
      </div>
    );
  };

  // Determine which screen to show
  const renderScreen = () => {
    // Secret admin login page
    if (view === 'admin-login') {
      return (
        <AdminLogin
          onSuccess={() => {
            setIsAdminLocal(true);
            setView('admin');
          }}
          onBack={() => {
            setView('landing');
            window.history.pushState({}, '', '/');
          }}
        />
      );
    }

    // Admin dashboard - show even without user profile
    if (view === 'admin' && isAdminLocal) {
      return (
        <AdminDashboard
          rooms={rooms}
          events={events}
          users={adminUsers}
          reports={adminReports}
          flaggedUsers={flaggedUsers}
          stats={adminStats}
          emails={adminEmails}
          onBack={() => {
            localStorage.removeItem('freedommeet_admin');
            setIsAdminLocal(false);
            setView('landing');
          }}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onCreateRoom={createDefaultRoom}
          onDeleteEvent={deleteEvent}
          onDeleteUser={adminDeleteUser}
          onLoadUsers={adminGetUsers}
          onLoadReports={adminGetReports}
          onLoadStats={adminGetStats}
          onExportEmails={adminExportEmails}
        />
      );
    }

    // Not logged in yet
    if (!user) {
      // Show landing page first, then login when they click Get Started
      if (!showLogin) {
        return (
          <LandingPage 
            onGetStarted={() => setShowLogin(true)}
            onlineCount={847}
            onViewTerms={() => setView('terms')}
            onViewPrivacy={() => setView('privacy')}
          />
        );
      }
      
      // Show login/registration
      return (
        <Login 
          onRegister={handleRegister} 
          isConnected={isConnected}
        />
      );
    }

    // In private chat
    if (privateChat) {
      return (
        <PrivateChat
          chat={privateChat}
          messages={messages}
          timer={timer}
          extendStatus={extendStatus}
          socketId={socketId}
          onSendMessage={sendPrivateMessage}
          onExtend={extend}
          onLeave={leavePrivate}
        />
      );
    }

    // In roulette chat
    if (currentMatch) {
      return (
        <RouletteChat
          match={currentMatch}
          messages={messages}
          timer={timer}
          likeStatus={likeStatus}
          socketId={socketId}
          onSendMessage={sendRouletteMessage}
          onLike={like}
          onSkip={skip}
        />
      );
    }

    // In queue waiting for match
    if (queueStatus && (queueStatus.status === 'joining' || queueStatus.status === 'waiting')) {
      return (
        <Queue 
          status={queueStatus} 
          onLeave={leaveQueue} 
        />
      );
    }

    // In an event room
    if (currentEvent) {
      return (
        <EventRoom
          event={currentEvent}
          messages={eventMessages}
          questions={eventQuestions}
          attendees={eventAttendees}
          socketId={socketId}
          isAdmin={isAdmin}
          onSendMessage={sendEventMessage}
          onSubmitQuestion={submitQuestion}
          onUpvoteQuestion={upvoteQuestion}
          onUpdateQuestionStatus={updateQuestionStatus}
          onStartEvent={startEvent}
          onEndEvent={endEvent}
          onLeave={() => {
            leaveEvent(currentEvent.id);
            setView('events');
          }}
        />
      );
    }

    // In a room chat
    if (currentRoom) {
      return (
        <RoomChat
          room={currentRoom}
          messages={roomMessages}
          socketId={socketId}
          onSendMessage={sendRoomMessage}
          onLeave={() => {
            leaveRoom(currentRoom.id);
            setView('rooms');
          }}
          onKickUser={kickUser}
          onBanUser={banUser}
          onDeleteRoom={(roomId) => {
            deleteRoom(roomId);
            setView('rooms');
          }}
          onUpdateProfile={updateProfile}
        />
      );
    }

    // Admin dashboard (for users who logged in via home button)
    if (view === 'admin' && (isAdmin || isAdminLocal)) {
      return (
        <AdminDashboard
          users={adminUsers}
          reports={adminReports}
          flaggedUsers={flaggedUsers}
          rooms={rooms}
          stats={adminStats}
          emails={adminEmails}
          onGetUsers={adminGetUsers}
          onGetReports={adminGetReports}
          onGetStats={adminGetStats}
          onExportEmails={adminExportEmails}
          onDeleteUser={adminDeleteUser}
          onBack={() => setView('home')}
        />
      );
    }

    // Events list
    if (view === 'events') {
      return (
        <EventList
          events={events}
          isAdmin={isAdmin}
          onJoinEvent={joinEvent}
          onCreateEvent={createEvent}
          onRsvp={rsvpEvent}
          onCancelRsvp={cancelRsvp}
          onDeleteEvent={deleteEvent}
          onBack={() => setView('home')}
        />
      );
    }

    // Viewing room list
    if (view === 'rooms') {
      return (
        <RoomList
          rooms={rooms}
          isAdmin={isAdmin}
          onJoinRoom={joinRoom}
          onCreateRoom={createRoom}
          onCreateDefaultRoom={createDefaultRoom}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onBack={() => setView('home')}
        />
      );
    }

    // Profile browser (Discover)
    if (view === 'discover') {
      return (
        <ProfileBrowser
          activeProfiles={browseProfiles.active}
          inactiveProfiles={browseProfiles.inactive}
          totalActive={browseProfiles.totalActive}
          totalInactive={browseProfiles.totalInactive}
          userGender={user?.gender}
          onLike={likeProfile}
          onLoadMore={() => {}}
          onFilterChange={(filters) => loadProfiles(filters)}
          onBack={() => setView('home')}
        />
      );
    }

    // Likes & Matches (Connections)
    if (view === 'connections') {
      return (
        <LikesAndMatches
          likes={likesReceived}
          matches={matches}
          onLikeBack={likeBack}
          onRemoveLike={removeLike}
          onUnmatch={unmatch}
          onScheduleChat={scheduleChat}
          onViewProfile={(profile) => setSelectedProfile(profile)}
          onBack={() => setView('home')}
        />
      );
    }

    // My Profile
    if (view === 'profile') {
      return (
        <MyProfile
          user={user}
          onUpdateProfile={async (data) => {
            // Update localStorage with new profile data
            const savedUser = localStorage.getItem('freedommeet_user');
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              const updatedUser = { ...userData, ...data };
              localStorage.setItem('freedommeet_user', JSON.stringify(updatedUser));
            }
            await updateProfile(data);
          }}
          onDeleteProfile={() => {
            if (confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
              deleteMyProfile();
            }
          }}
          onReportUser={reportUser}
          onLogout={handleLogout}
          onBack={() => setView('home')}
        />
      );
    }

    // Invite Friends
    if (view === 'invite') {
      return (
        <InviteFriends
          userId={socketId}
          inviteCount={inviteCount}
          onBack={() => setView('home')}
        />
      );
    }

    // Who Viewed Me
    if (view === 'views') {
      return (
        <WhoViewedMe
          views={profileViews}
          onViewProfile={(profile) => {
            viewProfile(profile.id);
            setSelectedProfile(profile);
          }}
          onBack={() => setView('home')}
        />
      );
    }

    // Terms of Service
    if (view === 'terms') {
      return <TermsOfService onBack={() => setView(user ? 'home' : 'landing')} />;
    }

    // Privacy Policy
    if (view === 'privacy') {
      return <PrivacyPolicy onBack={() => setView(user ? 'home' : 'landing')} />;
    }

    // Home screen
    return (
      <Home 
        user={user}
        isAdmin={isAdminLocal || isAdmin}
        upcomingEvents={upcomingEvents}
        likesCount={likesReceived.length}
        matchesCount={matches.length}
        viewsCount={profileViews.length}
        featuredProfiles={featuredProfiles}
        featuredGender={featuredGender}
        onFeaturedGenderChange={(gender) => {
          setFeaturedGender(gender);
          getFeaturedProfiles(gender);
        }}
        onViewFeaturedProfile={(profile) => {
          viewProfile(profile.id);
          setSelectedProfile(profile);
        }}
        onJoinRoulette={joinQueue}
        onViewRooms={() => setView('rooms')}
        onViewEvents={() => setView('events')}
        onViewAdmin={() => setView('admin')}
        onViewDiscover={() => setView('discover')}
        onViewConnections={() => setView('connections')}
        onViewProfile={() => setView('profile')}
        onViewInvite={() => setView('invite')}
        onViewViews={() => {
          getProfileViews();
          setView('views');
        }}
        onReportProblem={() => setShowReportModal(true)}
        onSuggestFeature={() => setShowSuggestModal(true)}
        onViewTerms={() => setView('terms')}
        onViewPrivacy={() => setView('privacy')}
        onJoinEvent={joinEvent}
      />
    );
  };

  // Report Problem Modal
  const ReportModal = () => {
    const [reportType, setReportType] = useState('bug');
    const [reportText, setReportText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      // In production, send to backend
      console.log('Report submitted:', { type: reportType, text: reportText });
      setSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setSubmitted(false);
        setReportText('');
      }, 2000);
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%'
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#2d2926' }}>Thank you!</p>
              <p style={{ color: '#8a8482' }}>Your report has been submitted.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>🚩 Report a Problem</h2>
                <button onClick={() => setShowReportModal(false)} style={{ fontSize: '24px', color: '#8a8482' }}>×</button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#5c5552', marginBottom: '8px' }}>
                  What's the issue?
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'bug', label: '🐛 Bug' },
                    { value: 'user', label: '👤 User' },
                    { value: 'content', label: '🚫 Content' },
                    { value: 'other', label: '❓ Other' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setReportType(opt.value)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: reportType === opt.value ? '#e85d75' : '#f5f2ef',
                        color: reportType === opt.value ? 'white' : '#5c5552'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#5c5552', marginBottom: '8px' }}>
                  Tell us more
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the problem..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '15px',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reportText.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: reportText.trim() ? 'linear-gradient(135deg, #e85d75, #d94a62)' : '#f0ebe7',
                  color: reportText.trim() ? 'white' : '#8a8482',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Submit Report
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Suggest Feature Modal
  const SuggestModal = () => {
    const [suggestText, setSuggestText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      console.log('Suggestion submitted:', suggestText);
      setSubmitted(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setSubmitted(false);
        setSuggestText('');
      }, 2000);
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%'
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#2d2926' }}>Great idea!</p>
              <p style={{ color: '#8a8482' }}>Thanks for your suggestion.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>💡 Suggest a Feature</h2>
                <button onClick={() => setShowSuggestModal(false)} style={{ fontSize: '24px', color: '#8a8482' }}>×</button>
              </div>

              <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '16px' }}>
                Have an idea to make FreedomMeet better? We'd love to hear it!
              </p>

              <div style={{ marginBottom: '20px' }}>
                <textarea
                  value={suggestText}
                  onChange={(e) => setSuggestText(e.target.value)}
                  placeholder="I wish FreedomMeet had..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '15px',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!suggestText.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: suggestText.trim() ? 'linear-gradient(135deg, #4abe7a, #3a9d64)' : '#f0ebe7',
                  color: suggestText.trim() ? 'white' : '#8a8482',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Submit Suggestion
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderScreen()}
      {renderError()}
      {showReportModal && <ReportModal />}
      {showSuggestModal && <SuggestModal />}
    </>
  );
}

export default App;
