import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [privateChat, setPrivateChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(null);
  const [error, setError] = useState(null);
  const [likeStatus, setLikeStatus] = useState({ liked: false, mutual: false });
  const [extendStatus, setExtendStatus] = useState({ voted: false, votedCount: 0 });
  
  // Room state
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Event state
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventMessages, setEventMessages] = useState([]);
  const [eventQuestions, setEventQuestions] = useState([]);
  const [eventAttendees, setEventAttendees] = useState([]);

  // Profile discovery state
  const [browseProfiles, setBrowseProfiles] = useState({ active: [], inactive: [], totalActive: 0, totalInactive: 0 });
  const [likesReceived, setLikesReceived] = useState([]);
  const [matches, setMatches] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Unable to connect to server');
    });

    socket.on('registered', (data) => {
      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    });

    socket.on('queue_status', (data) => {
      setQueueStatus(data);
    });

    socket.on('match_found', (data) => {
      setCurrentMatch(data);
      setQueueStatus(null);
      setMessages([]);
      setLikeStatus({ liked: false, mutual: false });
      setTimer(data.duration);
    });

    socket.on('timer_update', (data) => {
      setTimer(data.remaining);
    });

    socket.on('roulette_message', (data) => {
      setMessages(prev => [...prev, {
        id: `${data.timestamp}-${data.from}`,
        from: data.from,
        fromName: data.fromName,
        fromPhoto: data.fromPhoto,
        message: data.message,
        timestamp: data.timestamp,
        isOwn: data.from === socket.id
      }]);
    });

    socket.on('like_registered', (data) => {
      if (data.mutual) {
        setLikeStatus({ liked: true, mutual: true });
      }
    });

    socket.on('roulette_ended', (data) => {
      if (!data.mutual) {
        // Only reset if not going to private chat
        setCurrentMatch(null);
        setMessages([]);
        setTimer(null);
        setLikeStatus({ liked: false, mutual: false });
      }
    });

    socket.on('private_chat_started', (data) => {
      setPrivateChat(data);
      setCurrentMatch(null);
      setMessages([]);
      setTimer(data.duration);
      setExtendStatus({ voted: false, votedCount: 0 });
    });

    socket.on('private_message', (data) => {
      setMessages(prev => [...prev, {
        id: `${data.timestamp}-${data.from}`,
        from: data.from,
        fromName: data.fromName,
        fromPhoto: data.fromPhoto,
        message: data.message,
        timestamp: data.timestamp,
        isOwn: data.from === socket.id
      }]);
    });

    socket.on('extend_vote', (data) => {
      setExtendStatus(prev => ({ ...prev, votedCount: data.votedCount }));
    });

    socket.on('chat_extended', (data) => {
      setTimer(data.newDuration);
      setExtendStatus({ voted: false, votedCount: 0 });
    });

    socket.on('private_chat_ended', (data) => {
      setPrivateChat(null);
      setMessages([]);
      setTimer(null);
      setExtendStatus({ voted: false, votedCount: 0 });
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    // Room events
    socket.on('rooms_list', (data) => {
      setRooms(data.rooms);
    });

    socket.on('room_created', (data) => {
      setCurrentRoom(data.room);
      setRoomMessages([]);
    });

    socket.on('room_joined', (data) => {
      setCurrentRoom(data.room);
      setRoomMessages([]);
    });

    socket.on('room_left', (data) => {
      setCurrentRoom(null);
      setRoomMessages([]);
    });

    socket.on('room_message', (data) => {
      setRoomMessages(prev => [...prev, {
        id: `${data.timestamp}-${data.from}`,
        from: data.from,
        fromName: data.fromName,
        fromPhoto: data.fromPhoto,
        message: data.message,
        timestamp: data.timestamp,
        isOwn: data.from === socket.id
      }]);
    });

    socket.on('user_joined_room', (data) => {
      setCurrentRoom(prev => {
        if (!prev) return null;
        // Add new user to members array if not already there
        const existingMember = prev.members?.find(m => m.id === data.user?.id);
        const updatedMembers = existingMember 
          ? prev.members 
          : [...(prev.members || []), data.user].filter(Boolean);
        return { 
          ...prev, 
          memberCount: data.memberCount,
          members: updatedMembers
        };
      });
    });

    socket.on('user_left_room', (data) => {
      setCurrentRoom(prev => {
        if (!prev) return null;
        // Remove user from members array
        const updatedMembers = (prev.members || []).filter(m => m.id !== data.user?.id);
        return { 
          ...prev, 
          memberCount: data.memberCount,
          members: updatedMembers
        };
      });
    });

    socket.on('kicked_from_room', (data) => {
      setCurrentRoom(null);
      setRoomMessages([]);
      setError('You were kicked from the room');
    });

    socket.on('banned_from_room', (data) => {
      setCurrentRoom(null);
      setRoomMessages([]);
      setError('You were banned from the room');
    });

    socket.on('room_deleted', (data) => {
      if (currentRoom?.id === data.roomId) {
        setCurrentRoom(null);
        setRoomMessages([]);
        setError('Room was deleted');
      }
    });

    socket.on('admin_status', (data) => {
      setIsAdmin(data.isAdmin);
    });

    socket.on('admin_login_result', (data) => {
      setIsAdmin(data.success);
    });

    socket.on('room_updated', (data) => {
      setRooms(prev => prev.map(r => r.id === data.room.id ? { ...r, ...data.room } : r));
      if (currentRoom?.id === data.room.id) {
        setCurrentRoom(prev => ({ ...prev, ...data.room }));
      }
    });

    socket.on('profile_updated', (data) => {
      setUser(data.user);
    });

    socket.on('member_updated', (data) => {
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members?.map(m => 
            m.id === data.user.id ? { ...m, ...data.user } : m
          )
        };
      });
    });

    // Event listeners
    socket.on('events_list', (data) => {
      setEvents(data.events);
    });

    socket.on('upcoming_events', (data) => {
      setUpcomingEvents(data.events);
    });

    socket.on('event_created', (data) => {
      setEvents(prev => [...prev, data.event]);
    });

    socket.on('new_event', (data) => {
      setEvents(prev => {
        if (prev.find(e => e.id === data.event.id)) return prev;
        return [...prev, data.event];
      });
      setUpcomingEvents(prev => {
        if (prev.find(e => e.id === data.event.id)) return prev;
        return [...prev, data.event].sort((a, b) => a.scheduledAt - b.scheduledAt);
      });
    });

    socket.on('event_changed', (data) => {
      setEvents(prev => prev.map(e => e.id === data.event.id ? data.event : e));
      setUpcomingEvents(prev => prev.map(e => e.id === data.event.id ? data.event : e));
      if (currentEvent?.id === data.event.id) {
        setCurrentEvent(prev => ({ ...prev, ...data.event }));
      }
    });

    socket.on('event_deleted', (data) => {
      setEvents(prev => prev.filter(e => e.id !== data.eventId));
      setUpcomingEvents(prev => prev.filter(e => e.id !== data.eventId));
      if (currentEvent?.id === data.eventId) {
        setCurrentEvent(null);
      }
    });

    socket.on('event_joined', (data) => {
      setCurrentEvent(data.event);
      setEventAttendees(data.attendees || []);
      setEventQuestions(data.questions || []);
      setEventMessages([]);
    });

    socket.on('event_started', (data) => {
      setEvents(prev => prev.map(e => e.id === data.eventId ? { ...e, status: 'live' } : e));
      if (currentEvent?.id === data.eventId) {
        setCurrentEvent(prev => ({ ...prev, status: 'live' }));
      }
    });

    socket.on('event_ended', (data) => {
      setEvents(prev => prev.map(e => e.id === data.eventId ? { ...e, status: 'ended' } : e));
      if (currentEvent?.id === data.eventId) {
        setCurrentEvent(prev => ({ ...prev, status: 'ended' }));
      }
    });

    socket.on('attendee_joined', (data) => {
      if (currentEvent?.id === data.eventId) {
        setCurrentEvent(prev => ({ ...prev, attendeeCount: data.attendeeCount }));
        if (data.user) {
          setEventAttendees(prev => {
            if (prev.find(a => a.id === data.user.id)) return prev;
            return [...prev, data.user];
          });
        }
      }
    });

    socket.on('attendee_left', (data) => {
      if (currentEvent?.id === data.eventId) {
        setCurrentEvent(prev => ({ ...prev, attendeeCount: data.attendeeCount }));
        setEventAttendees(prev => prev.filter(a => a.id !== data.oderId));
      }
    });

    socket.on('event_message', (data) => {
      setEventMessages(prev => [...prev, {
        ...data,
        isOwn: data.senderId === socket.id
      }]);
    });

    socket.on('new_question', (data) => {
      setEventQuestions(prev => [...prev, data]);
    });

    socket.on('question_updated', (data) => {
      setEventQuestions(prev => prev.map(q => q.id === data.id ? data : q));
    });

    socket.on('rsvp_success', (data) => {
      setEvents(prev => prev.map(e => 
        e.id === data.eventId ? { ...e, rsvpCount: data.rsvpCount, hasRsvp: true } : e
      ));
    });

    socket.on('rsvp_cancelled', (data) => {
      setEvents(prev => prev.map(e => 
        e.id === data.eventId ? { ...e, rsvpCount: data.rsvpCount, hasRsvp: false } : e
      ));
    });

    socket.on('event_rsvp_updated', (data) => {
      setEvents(prev => prev.map(e => 
        e.id === data.eventId ? { ...e, rsvpCount: data.rsvpCount } : e
      ));
    });

    // ============ PROFILE DISCOVERY LISTENERS ============

    socket.on('profiles_list', (data) => {
      setBrowseProfiles({
        active: data.activeProfiles || [],
        inactive: data.inactiveProfiles || [],
        totalActive: data.totalActive || 0,
        totalInactive: data.totalInactive || 0
      });
    });

    socket.on('like_result', (data) => {
      if (!data.success) {
        setError(data.error);
      }
    });

    socket.on('new_like', (data) => {
      setLikesReceived(prev => {
        if (prev.find(l => l.userId === data.profile.id)) return prev;
        return [{ userId: data.profile.id, profile: data.profile, likedAt: Date.now(), isOnline: true }, ...prev];
      });
    });

    socket.on('likes_list', (data) => {
      setLikesReceived(data.likes || []);
    });

    socket.on('like_removed', (data) => {
      setLikesReceived(prev => prev.filter(l => l.userId !== data.userId));
    });

    socket.on('new_match', (data) => {
      setMatches(prev => {
        if (prev.find(m => m.userId === data.profile.id)) return prev;
        return [{ userId: data.profile.id, profile: data.profile, matchedAt: Date.now(), isOnline: true }, ...prev];
      });
      // Remove from likes received since they're now matched
      setLikesReceived(prev => prev.filter(l => l.userId !== data.profile.id));
    });

    socket.on('matches_list', (data) => {
      setMatches(data.matches || []);
    });

    socket.on('unmatched', (data) => {
      setMatches(prev => prev.filter(m => m.userId !== data.userId));
    });

    socket.on('chat_scheduled', (data) => {
      setMatches(prev => prev.map(m => 
        m.userId === data.users?.find(id => id !== socket.id) 
          ? { ...m, scheduledChat: data }
          : m
      ));
    });

    socket.on('chat_cancelled', (data) => {
      setMatches(prev => prev.map(m => 
        m.scheduledChat?.id === data.chatId
          ? { ...m, scheduledChat: null }
          : m
      ));
    });

    // Profile views listeners
    socket.on('profile_views', (data) => {
      setProfileViews(data.views || []);
    });

    socket.on('featured_profiles', (data) => {
      setFeaturedProfiles(data.profiles || []);
    });

    socket.on('invite_count', (data) => {
      setInviteCount(data.count || 0);
    });

    socket.on('invite_tracked', (data) => {
      setInviteCount(data.count || 0);
    });

    socket.on('profile_deleted', () => {
      // Clear local storage and reload
      localStorage.removeItem('freedommeet_user');
      window.location.reload();
    });

    // Admin listeners
    socket.on('admin_users', (data) => {
      setAdminUsers(data.users || []);
    });

    socket.on('admin_reports', (data) => {
      setAdminReports(data.reports || []);
      setFlaggedUsers(data.flagged || []);
    });

    socket.on('admin_user_deleted', (data) => {
      setAdminUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    socket.on('admin_stats', (data) => {
      setAdminStats(data);
    });

    socket.on('admin_emails', (data) => {
      setAdminEmails(data.emails || []);
    });

    socket.on('user_flagged', (data) => {
      // Could show a notification to admin
      console.log('User flagged:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Register user
  const register = useCallback((userData) => {
    if (socketRef.current) {
      socketRef.current.emit('register', userData);
    }
  }, []);

  // Join roulette queue
  const joinQueue = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('join_queue');
    }
  }, []);

  // Leave queue
  const leaveQueue = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave_queue');
      setQueueStatus(null);
    }
  }, []);

  // Send message in roulette
  const sendRouletteMessage = useCallback((sessionId, message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('roulette_message', { sessionId, message });
    }
  }, []);

  // Like current match
  const like = useCallback((sessionId) => {
    if (socketRef.current) {
      socketRef.current.emit('like', { sessionId });
      setLikeStatus(prev => ({ ...prev, liked: true }));
    }
  }, []);

  // Skip current match
  const skip = useCallback((sessionId) => {
    if (socketRef.current) {
      socketRef.current.emit('skip', { sessionId });
    }
  }, []);

  // Send private message
  const sendPrivateMessage = useCallback((chatId, message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('private_message', { chatId, message });
    }
  }, []);

  // Vote to extend
  const extend = useCallback((chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('extend', { chatId });
      setExtendStatus(prev => ({ ...prev, voted: true }));
    }
  }, []);

  // Leave private chat
  const leavePrivate = useCallback((chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_private', { chatId });
    }
  }, []);

  // ============================================
  // ROOM ACTIONS
  // ============================================

  // Get all rooms
  const getRooms = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_rooms');
    }
  }, []);

  // Create a room
  const createRoom = useCallback((roomData) => {
    if (socketRef.current) {
      socketRef.current.emit('create_room', roomData);
    }
  }, []);

  // Join a room
  const joinRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId });
    }
  }, []);

  // Leave a room
  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { roomId });
    }
  }, []);

  // Send room message
  const sendRoomMessage = useCallback((roomId, message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('room_message', { roomId, message });
    }
  }, []);

  // Kick user (moderator)
  const kickUser = useCallback((roomId, targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('kick_user', { roomId, targetSocketId });
    }
  }, []);

  // Ban user (moderator)
  const banUser = useCallback((roomId, targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('ban_user', { roomId, targetSocketId });
    }
  }, []);

  // Delete room (creator)
  const deleteRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('delete_room', { roomId });
    }
  }, []);

  // Update room (admin or creator)
  const updateRoom = useCallback((roomId, updates) => {
    if (socketRef.current) {
      socketRef.current.emit('update_room', { roomId, updates });
    }
  }, []);

  // Create default room (admin only)
  const createDefaultRoom = useCallback((roomData) => {
    if (socketRef.current) {
      socketRef.current.emit('create_default_room', roomData);
    }
  }, []);

  // Check admin status
  const checkAdmin = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('check_admin');
    }
  }, []);

  // Admin login with password
  const adminLogin = useCallback((password) => {
    return new Promise((resolve) => {
      if (socketRef.current) {
        socketRef.current.emit('admin_login', { password });
        socketRef.current.once('admin_login_result', (data) => {
          resolve(data.success);
        });
      } else {
        resolve(false);
      }
    });
  }, []);

  // Update user profile
  const updateProfile = useCallback((updates) => {
    if (socketRef.current) {
      socketRef.current.emit('update_profile', updates);
    }
  }, []);

  // Get user profile
  const getProfile = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('get_profile', { userId });
    }
  }, []);

  // ============================================
  // EVENT ACTIONS
  // ============================================

  const getEvents = useCallback((includeEnded = false) => {
    if (socketRef.current) {
      socketRef.current.emit('get_events', { includeEnded });
    }
  }, []);

  const getUpcomingEvents = useCallback((limit = 5) => {
    if (socketRef.current) {
      socketRef.current.emit('get_upcoming_events', { limit });
    }
  }, []);

  const createEvent = useCallback((eventData) => {
    if (socketRef.current) {
      socketRef.current.emit('create_event', eventData);
    }
  }, []);

  const updateEvent = useCallback((eventId, updates) => {
    if (socketRef.current) {
      socketRef.current.emit('update_event', { eventId, updates });
    }
  }, []);

  const deleteEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('delete_event', { eventId });
    }
  }, []);

  const rsvpEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('rsvp_event', { eventId });
    }
  }, []);

  const cancelRsvp = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('cancel_rsvp', { eventId });
    }
  }, []);

  const startEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('start_event', { eventId });
    }
  }, []);

  const endEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('end_event', { eventId });
    }
  }, []);

  const joinEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_event', { eventId });
    }
  }, []);

  const leaveEvent = useCallback((eventId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_event', { eventId });
      setCurrentEvent(null);
      setEventMessages([]);
      setEventQuestions([]);
      setEventAttendees([]);
    }
  }, []);

  const sendEventMessage = useCallback((eventId, message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('event_message', { eventId, message });
    }
  }, []);

  const submitQuestion = useCallback((eventId, question) => {
    if (socketRef.current && question.trim()) {
      socketRef.current.emit('submit_question', { eventId, question });
    }
  }, []);

  const upvoteQuestion = useCallback((eventId, questionId) => {
    if (socketRef.current) {
      socketRef.current.emit('upvote_question', { eventId, questionId });
    }
  }, []);

  const updateQuestionStatus = useCallback((eventId, questionId, status) => {
    if (socketRef.current) {
      socketRef.current.emit('update_question_status', { eventId, questionId, status });
    }
  }, []);

  const getEventStats = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_all_events_stats');
    }
  }, []);

  // ============ PROFILE DISCOVERY ACTIONS ============

  const loadProfiles = useCallback((filters = {}) => {
    if (socketRef.current) {
      socketRef.current.emit('browse_profiles', filters);
    }
  }, []);

  const likeProfile = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('like_profile', { userId });
      // Remove from browse list immediately for better UX
      setBrowseProfiles(prev => prev.filter(p => p.id !== userId));
    }
  }, []);

  const getLikes = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_likes');
    }
  }, []);

  const removeLike = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('remove_like', { userId });
    }
  }, []);

  const likeBack = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('like_back', { userId });
    }
  }, []);

  const getMatches = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_matches');
    }
  }, []);

  const unmatch = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('unmatch', { userId });
    }
  }, []);

  const scheduleChat = useCallback((matchId, scheduledTime, duration) => {
    if (socketRef.current) {
      socketRef.current.emit('schedule_chat', { matchId, scheduledTime, duration });
    }
  }, []);

  const cancelScheduledChat = useCallback((matchId, chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('cancel_scheduled_chat', { matchId, chatId });
    }
  }, []);

  // ============ PROFILE VIEWS & REPORTS ============

  const [profileViews, setProfileViews] = useState([]);
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [inviteCount, setInviteCount] = useState(0);
  
  // Admin state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [adminEmails, setAdminEmails] = useState([]);

  const viewProfile = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('view_profile', { userId });
    }
  }, []);

  const getProfileViews = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_profile_views');
    }
  }, []);

  const getFeaturedProfiles = useCallback((gender = null) => {
    if (socketRef.current) {
      socketRef.current.emit('get_featured_profiles', { gender });
    }
  }, []);

  const reportUser = useCallback((userId, reason) => {
    if (socketRef.current) {
      socketRef.current.emit('report_user', { userId, reason });
    }
  }, []);

  const deleteMyProfile = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('delete_my_profile');
    }
  }, []);

  const getInviteCount = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_invite_count');
    }
  }, []);

  // Admin actions
  const adminGetUsers = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('admin_get_users');
    }
  }, []);

  const adminGetReports = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('admin_get_reports');
    }
  }, []);

  const adminDeleteUser = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('admin_delete_user', { userId });
    }
  }, []);

  const adminGetStats = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('admin_get_stats');
    }
  }, []);

  const adminExportEmails = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('admin_export_emails');
    }
  }, []);

  return {
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
    socketId: socketRef.current?.id,
    // Roulette actions
    register,
    joinQueue,
    leaveQueue,
    sendRouletteMessage,
    like,
    skip,
    sendPrivateMessage,
    extend,
    leavePrivate,
    clearError: () => setError(null),
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
    getProfile,
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
    updateEvent,
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
    // Profile discovery state
    browseProfiles,
    likesReceived,
    matches,
    profileViews,
    featuredProfiles,
    inviteCount,
    // Profile discovery actions
    loadProfiles,
    likeProfile,
    getLikes,
    removeLike,
    likeBack,
    getMatches,
    unmatch,
    scheduleChat,
    cancelScheduledChat,
    viewProfile,
    getProfileViews,
    getFeaturedProfiles,
    reportUser,
    deleteMyProfile,
    getInviteCount,
    // Admin state
    adminUsers,
    adminReports,
    flaggedUsers,
    adminStats,
    adminEmails,
    // Admin actions
    adminGetUsers,
    adminGetReports,
    adminDeleteUser,
    adminGetStats,
    adminExportEmails
  };
}
