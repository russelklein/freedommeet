/**
 * Dating Chat Server
 * Ephemeral chat with roulette matching - no messages stored
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { RouletteManager } = require('./roulette');
const { EventManager } = require('./events');
const { ProfileManager } = require('./profiles');
const { StatsManager } = require('./stats');

// Config
const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Allow multiple frontend origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  // Add your Render URLs here after deploying
].filter(Boolean);

// Initialize Express
const app = express();
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true 
}));
app.use(express.json());

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Redis
let redis;
let rouletteManager;
let eventManager;
let profileManager;
let statsManager;

async function initRedis() {
  redis = createClient({ url: REDIS_URL });
  
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  await redis.connect();
  
  // Initialize managers
  rouletteManager = new RouletteManager(redis, io);
  eventManager = new EventManager(redis, io);
  profileManager = new ProfileManager(redis, io);
  statsManager = new StatsManager(redis);
  
  return redis;
}

// Helper to get persistent userId from socket.id
async function getUserIdFromSocket(socketId) {
  const odditionalMaterials = await redis.get(`socket:${socketId}:userId`);
  return odditionalMaterials || socketId;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user (Stage 1: test users, Stage 2: Facebook auth)
  socket.on('register', async (userData) => {
    try {
      // Use persistent userId if provided, otherwise use socket.id
      const userId = userData.persistentId || socket.id;
      
      // Check if this user already exists (returning user)
      const existingProfile = await profileManager.getProfile(userId);
      const isReturningUser = !!existingProfile;
      
      const user = {
        id: userId,
        socketId: socket.id,
        name: userData.name || `User_${userId.substr(0, 6)}`,
        photo: userData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        photos: userData.photos || [],
        city: userData.city || '',
        bio: userData.bio || '',
        age: userData.age || null,
        gender: userData.gender || null,
        registeredAt: existingProfile?.registeredAt || Date.now()
      };

      // Map socket to persistent user ID
      await rouletteManager.addUser(socket.id, { ...user, odditionalMaterials: userId });
      await redis.set(`socket:${socket.id}:userId`, userId);
      await redis.set(`user:${userId}:socketId`, socket.id);
      
      // Save/update profile
      await profileManager.saveProfile(userId, user);
      
      // Only track signup stats for new users
      if (!isReturningUser) {
        await statsManager.trackSignup(user);
        console.log(`New user registered: ${user.name} (${user.gender})`);
      } else {
        console.log(`Returning user: ${user.name}`);
      }
      
      socket.emit('registered', { success: true, user: { ...user, id: userId } });
    } catch (err) {
      console.error('Register error:', err);
      socket.emit('registered', { success: false, error: err.message });
    }
  });

  // Join roulette queue
  socket.on('join_queue', async () => {
    try {
      const user = await rouletteManager.getUser(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Please register first' });
        return;
      }
      
      if (!user.gender) {
        socket.emit('error', { message: 'Please select your gender to use roulette matching' });
        return;
      }

      socket.emit('queue_status', { status: 'joining' });
      
      const result = await rouletteManager.joinQueue(socket.id);
      
      if (result.reason === 'gender_required') {
        socket.emit('error', { message: 'Please select your gender to use roulette matching' });
        return;
      }
      
      if (result.success) {
        // Match found!
        const user1 = await rouletteManager.getUser(result.user1);
        const user2 = await rouletteManager.getUser(result.user2);

        // Join both users to session room
        const socket1 = io.sockets.sockets.get(result.user1);
        const socket2 = io.sockets.sockets.get(result.user2);

        if (socket1) socket1.join(result.sessionId);
        if (socket2) socket2.join(result.sessionId);

        // Notify both users
        io.to(result.sessionId).emit('match_found', {
          sessionId: result.sessionId,
          duration: result.duration,
          users: {
            [result.user1]: user1,
            [result.user2]: user2
          }
        });

        console.log(`Match created: ${user1.name} <-> ${user2.name}`);
      } else {
        socket.emit('queue_status', { 
          status: 'waiting',
          position: result.queuePosition || 1
        });
      }
    } catch (err) {
      console.error('Join queue error:', err);
      socket.emit('error', { message: 'Failed to join queue' });
    }
  });

  // Leave queue
  socket.on('leave_queue', async () => {
    try {
      await rouletteManager.leaveQueue(socket.id);
      socket.emit('queue_status', { status: 'left' });
    } catch (err) {
      console.error('Leave queue error:', err);
    }
  });

  // Send message in roulette chat
  socket.on('roulette_message', async ({ sessionId, message }) => {
    try {
      const user = await rouletteManager.getUser(socket.id);
      if (!user) return;

      // Broadcast to session room (not stored!)
      io.to(sessionId).emit('roulette_message', {
        sessionId,
        from: socket.id,
        fromName: user.name,
        fromPhoto: user.photo,
        message,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  // Like user in roulette
  socket.on('like', async ({ sessionId }) => {
    try {
      const result = await rouletteManager.registerLike(sessionId, socket.id);
      
      // Notify the room about the like (but not who)
      io.to(sessionId).emit('like_registered', {
        sessionId,
        mutual: result.mutual
      });

      if (result.mutual) {
        // Get session to find both users
        const session = await rouletteManager.getSession(sessionId);
        if (session) {
          // Create private chat
          const privateChat = await rouletteManager.createPrivateChat(
            session.user1,
            session.user2
          );

          // End roulette session
          await rouletteManager.endRouletteSession(sessionId, 'mutual_like');

          // Move users to private chat room
          const socket1 = io.sockets.sockets.get(session.user1);
          const socket2 = io.sockets.sockets.get(session.user2);

          if (socket1) {
            socket1.leave(sessionId);
            socket1.join(privateChat.chatId);
          }
          if (socket2) {
            socket2.leave(sessionId);
            socket2.join(privateChat.chatId);
          }

          const user1 = await rouletteManager.getUser(session.user1);
          const user2 = await rouletteManager.getUser(session.user2);

          // Notify about private chat
          io.to(privateChat.chatId).emit('private_chat_started', {
            chatId: privateChat.chatId,
            duration: privateChat.duration,
            users: {
              [session.user1]: user1,
              [session.user2]: user2
            }
          });

          console.log(`Private chat started: ${user1.name} <-> ${user2.name}`);
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  });

  // Skip current match
  socket.on('skip', async ({ sessionId }) => {
    try {
      await rouletteManager.skipMatch(sessionId, socket.id);
    } catch (err) {
      console.error('Skip error:', err);
    }
  });

  // Send message in private chat
  socket.on('private_message', async ({ chatId, message }) => {
    try {
      const user = await rouletteManager.getUser(socket.id);
      if (!user) return;

      // Broadcast to private room (not stored!)
      io.to(chatId).emit('private_message', {
        chatId,
        from: socket.id,
        fromName: user.name,
        fromPhoto: user.photo,
        message,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Private message error:', err);
    }
  });

  // Vote to extend private chat
  socket.on('extend', async ({ chatId }) => {
    try {
      const result = await rouletteManager.voteExtend(chatId, socket.id);
      
      if (!result.extended) {
        // Notify that user voted to extend
        io.to(chatId).emit('extend_vote', {
          chatId,
          voterId: socket.id,
          votedCount: result.votedCount
        });
      }
      // If extended, rouletteManager already emits 'chat_extended'
    } catch (err) {
      console.error('Extend error:', err);
    }
  });

  // Leave private chat
  socket.on('leave_private', async ({ chatId }) => {
    try {
      await rouletteManager.endPrivateChat(chatId, 'user_left');
      socket.leave(chatId);
    } catch (err) {
      console.error('Leave private error:', err);
    }
  });

  // ============================================
  // ROOM EVENTS
  // ============================================

  // Get all rooms
  socket.on('get_rooms', async () => {
    try {
      const rooms = await rouletteManager.getAllRooms();
      socket.emit('rooms_list', { rooms });
    } catch (err) {
      console.error('Get rooms error:', err);
      socket.emit('error', { message: 'Failed to get rooms' });
    }
  });

  // Create a room
  socket.on('create_room', async (roomData) => {
    try {
      const result = await rouletteManager.createRoom(socket.id, roomData);
      
      if (result.success) {
        socket.join(`room_${result.room.id}`);
        socket.emit('room_created', { room: result.room });
        
        // Broadcast updated room list to everyone
        const rooms = await rouletteManager.getAllRooms();
        io.emit('rooms_list', { rooms });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Create room error:', err);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join a room
  socket.on('join_room', async ({ roomId }) => {
    try {
      const result = await rouletteManager.joinRoom(socket.id, roomId);
      
      if (result.success) {
        socket.join(`room_${roomId}`);
        
        const user = await rouletteManager.getUser(socket.id);
        const room = await rouletteManager.getRoom(roomId);
        
        socket.emit('room_joined', { room });
        
        // Notify others in room
        socket.to(`room_${roomId}`).emit('user_joined_room', {
          roomId,
          user,
          memberCount: room.memberCount
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Join room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a room
  socket.on('leave_room', async ({ roomId }) => {
    try {
      await rouletteManager.leaveRoom(socket.id, roomId);
      socket.leave(`room_${roomId}`);
      
      const user = await rouletteManager.getUser(socket.id);
      const room = await rouletteManager.getRoom(roomId);
      
      socket.emit('room_left', { roomId });
      
      // Notify others
      socket.to(`room_${roomId}`).emit('user_left_room', {
        roomId,
        user,
        memberCount: room?.memberCount || 0
      });
    } catch (err) {
      console.error('Leave room error:', err);
    }
  });

  // Send message in room
  socket.on('room_message', async ({ roomId, message }) => {
    try {
      const user = await rouletteManager.getUser(socket.id);
      if (!user) return;

      // Broadcast to room (not stored!)
      io.to(`room_${roomId}`).emit('room_message', {
        roomId,
        from: socket.id,
        fromName: user.name,
        fromPhoto: user.photo,
        message,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Room message error:', err);
    }
  });

  // Kick user (moderator)
  socket.on('kick_user', async ({ roomId, targetSocketId }) => {
    try {
      const result = await rouletteManager.kickUser(socket.id, targetSocketId, roomId);
      
      if (result.success) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(`room_${roomId}`);
          targetSocket.emit('kicked_from_room', { roomId });
        }
        
        io.to(`room_${roomId}`).emit('user_kicked', {
          roomId,
          visitorSessionId: targetSocketId
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Kick user error:', err);
    }
  });

  // Ban user (moderator)
  socket.on('ban_user', async ({ roomId, targetSocketId }) => {
    try {
      const result = await rouletteManager.banUser(socket.id, targetSocketId, roomId);
      
      if (result.success) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(`room_${roomId}`);
          targetSocket.emit('banned_from_room', { roomId });
        }
        
        io.to(`room_${roomId}`).emit('user_banned', {
          roomId,
          visitorSessionId: targetSocketId
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Ban user error:', err);
    }
  });

  // Delete room (creator only)
  socket.on('delete_room', async ({ roomId }) => {
    try {
      const result = await rouletteManager.deleteRoom(socket.id, roomId);
      
      if (result.success) {
        io.to(`room_${roomId}`).emit('room_deleted', { roomId });
        
        // Broadcast updated room list
        const rooms = await rouletteManager.getAllRooms();
        io.emit('rooms_list', { rooms });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Delete room error:', err);
    }
  });

  // Update room (admin or creator)
  socket.on('update_room', async ({ roomId, updates }) => {
    try {
      const result = await rouletteManager.updateRoom(socket.id, roomId, updates);
      
      if (result.success) {
        io.to(`room_${roomId}`).emit('room_updated', { room: result.room });
        
        // Broadcast updated room list
        const rooms = await rouletteManager.getAllRooms();
        io.emit('rooms_list', { rooms });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Update room error:', err);
    }
  });

  // Create default room (admin only)
  socket.on('create_default_room', async (roomData) => {
    try {
      const result = await rouletteManager.createDefaultRoom(socket.id, roomData);
      
      if (result.success) {
        socket.emit('room_created', { room: result.room });
        
        // Broadcast updated room list
        const rooms = await rouletteManager.getAllRooms();
        io.emit('rooms_list', { rooms });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Create default room error:', err);
    }
  });

  // Check if user is admin
  socket.on('check_admin', async () => {
    try {
      const isAdmin = rouletteManager.isAdmin(socket.id);
      socket.emit('admin_status', { isAdmin });
    } catch (err) {
      console.error('Check admin error:', err);
    }
  });

  // Admin login with password
  socket.on('admin_login', async ({ password }) => {
    try {
      const success = rouletteManager.authenticateAdmin(socket.id, password);
      socket.emit('admin_login_result', { success });
      if (success) {
        console.log(`Admin logged in: ${socket.id}`);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      socket.emit('admin_login_result', { success: false });
    }
  });

  // Update user profile (photos, city, bio)
  socket.on('update_profile', async (updates) => {
    try {
      const user = await rouletteManager.getUser(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const updatedUser = {
        ...user,
        photo: updates.photo || user.photo,
        photos: updates.photos || user.photos || [],
        city: updates.city?.slice(0, 100) || user.city || '',
        bio: updates.bio?.slice(0, 500) || user.bio || ''
      };

      await rouletteManager.addUser(socket.id, updatedUser);
      socket.emit('profile_updated', { user: updatedUser });
      
      // Notify rooms the user is in about profile update
      const userRooms = await rouletteManager.redis.sMembers(`user:${socket.id}:rooms`);
      for (const roomId of userRooms) {
        socket.to(`room_${roomId}`).emit('member_updated', { user: updatedUser });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      socket.emit('error', { message: 'Failed to update profile' });
    }
  });

  // Get user profile by ID
  socket.on('get_profile', async ({ userId }) => {
    try {
      const user = await rouletteManager.getUser(userId);
      if (user) {
        socket.emit('profile_data', { user });
      } else {
        socket.emit('error', { message: 'User not found' });
      }
    } catch (err) {
      console.error('Get profile error:', err);
    }
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Get all events
  socket.on('get_events', async ({ includeEnded }) => {
    try {
      const events = await eventManager.getAllEvents(includeEnded);
      socket.emit('events_list', { events });
    } catch (err) {
      console.error('Get events error:', err);
      socket.emit('error', { message: 'Failed to get events' });
    }
  });

  // Get upcoming events
  socket.on('get_upcoming_events', async ({ limit }) => {
    try {
      const events = await eventManager.getUpcomingEvents(limit || 5);
      socket.emit('upcoming_events', { events });
    } catch (err) {
      console.error('Get upcoming events error:', err);
    }
  });

  // Get single event
  socket.on('get_event', async ({ eventId }) => {
    try {
      const event = await eventManager.getEvent(eventId);
      if (event) {
        const hasRsvp = await eventManager.hasRsvp(socket.id, eventId);
        socket.emit('event_data', { event, hasRsvp });
      } else {
        socket.emit('error', { message: 'Event not found' });
      }
    } catch (err) {
      console.error('Get event error:', err);
    }
  });

  // Create event
  socket.on('create_event', async (eventData) => {
    try {
      const result = await eventManager.createEvent(
        socket.id, 
        eventData,
        (id) => rouletteManager.getUser(id)
      );
      
      if (result.success) {
        socket.emit('event_created', { event: result.event });
        // Broadcast to all users
        io.emit('new_event', { event: result.event });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Create event error:', err);
      socket.emit('error', { message: 'Failed to create event' });
    }
  });

  // Update event
  socket.on('update_event', async ({ eventId, updates }) => {
    try {
      const result = await eventManager.updateEvent(
        socket.id,
        eventId,
        updates,
        (id) => rouletteManager.isAdmin(id)
      );
      
      if (result.success) {
        socket.emit('event_updated', { event: result.event });
        io.emit('event_changed', { event: result.event });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Update event error:', err);
    }
  });

  // Delete event
  socket.on('delete_event', async ({ eventId }) => {
    try {
      const result = await eventManager.deleteEvent(
        socket.id,
        eventId,
        (id) => rouletteManager.isAdmin(id)
      );
      
      if (result.success) {
        io.emit('event_deleted', { eventId });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Delete event error:', err);
    }
  });

  // RSVP to event
  socket.on('rsvp_event', async ({ eventId }) => {
    try {
      const result = await eventManager.rsvpToEvent(
        socket.id,
        eventId,
        (id) => rouletteManager.getUser(id)
      );
      
      if (result.success) {
        socket.emit('rsvp_success', { eventId, rsvpCount: result.rsvpCount });
        io.emit('event_rsvp_updated', { eventId, rsvpCount: result.rsvpCount });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('RSVP error:', err);
    }
  });

  // Cancel RSVP
  socket.on('cancel_rsvp', async ({ eventId }) => {
    try {
      const result = await eventManager.cancelRsvp(socket.id, eventId);
      socket.emit('rsvp_cancelled', { eventId, rsvpCount: result.rsvpCount });
      io.emit('event_rsvp_updated', { eventId, rsvpCount: result.rsvpCount });
    } catch (err) {
      console.error('Cancel RSVP error:', err);
    }
  });

  // Start event (speaker/admin)
  socket.on('start_event', async ({ eventId }) => {
    try {
      const result = await eventManager.startEvent(
        socket.id,
        eventId,
        (id) => rouletteManager.isAdmin(id)
      );
      
      if (result.success) {
        io.emit('event_started', { eventId, event: result.event });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Start event error:', err);
    }
  });

  // End event (speaker/admin)
  socket.on('end_event', async ({ eventId }) => {
    try {
      const result = await eventManager.endEvent(
        socket.id,
        eventId,
        (id) => rouletteManager.isAdmin(id)
      );
      
      if (result.success) {
        io.emit('event_ended', { eventId });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('End event error:', err);
    }
  });

  // Join event room
  socket.on('join_event', async ({ eventId }) => {
    try {
      const result = await eventManager.joinEventRoom(
        socket.id,
        eventId,
        (id) => rouletteManager.getUser(id)
      );
      
      if (result.success) {
        socket.join(`event_${eventId}`);
        
        const attendees = await eventManager.getEventAttendees(
          eventId,
          (id) => rouletteManager.getUser(id)
        );
        const questions = await eventManager.getQuestions(eventId);
        
        socket.emit('event_joined', { 
          event: result.event, 
          attendeeCount: result.attendeeCount,
          attendees,
          questions
        });
        
        // Notify others
        const user = await rouletteManager.getUser(socket.id);
        socket.to(`event_${eventId}`).emit('attendee_joined', {
          eventId,
          user,
          attendeeCount: result.attendeeCount
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Join event error:', err);
    }
  });

  // Leave event room
  socket.on('leave_event', async ({ eventId }) => {
    try {
      const result = await eventManager.leaveEventRoom(socket.id, eventId);
      socket.leave(`event_${eventId}`);
      
      const user = await rouletteManager.getUser(socket.id);
      socket.to(`event_${eventId}`).emit('attendee_left', {
        eventId,
        userId: socket.id,
        attendeeCount: result.attendeeCount
      });
    } catch (err) {
      console.error('Leave event error:', err);
    }
  });

  // Send chat message in event
  socket.on('event_message', async ({ eventId, message }) => {
    try {
      const result = await eventManager.sendEventMessage(
        socket.id,
        eventId,
        message,
        (id) => rouletteManager.getUser(id)
      );
      
      if (result.success) {
        io.to(`event_${eventId}`).emit('event_message', result.message);
      }
    } catch (err) {
      console.error('Event message error:', err);
    }
  });

  // Submit question
  socket.on('submit_question', async ({ eventId, question }) => {
    try {
      const result = await eventManager.submitQuestion(
        socket.id,
        eventId,
        question,
        (id) => rouletteManager.getUser(id)
      );
      
      if (result.success) {
        io.to(`event_${eventId}`).emit('new_question', result.question);
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Submit question error:', err);
    }
  });

  // Upvote question
  socket.on('upvote_question', async ({ eventId, questionId }) => {
    try {
      const result = await eventManager.upvoteQuestion(socket.id, eventId, questionId);
      
      if (result.success) {
        io.to(`event_${eventId}`).emit('question_updated', result.question);
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Upvote question error:', err);
    }
  });

  // Update question status (speaker/admin)
  socket.on('update_question_status', async ({ eventId, questionId, status }) => {
    try {
      const result = await eventManager.updateQuestionStatus(
        socket.id,
        eventId,
        questionId,
        status,
        (id) => rouletteManager.isAdmin(id),
        (id) => eventManager.getEvent(id)
      );
      
      if (result.success) {
        io.to(`event_${eventId}`).emit('question_updated', result.question);
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Update question status error:', err);
    }
  });

  // Get event stats (admin)
  socket.on('get_all_events_stats', async () => {
    try {
      const isAdmin = await rouletteManager.isAdmin(socket.id);
      if (!isAdmin) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      const stats = await eventManager.getAllEventsStats();
      socket.emit('all_events_stats', stats);
    } catch (err) {
      console.error('Get stats error:', err);
    }
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);
      rouletteManager.removeAdminSession(socket.id);
      await rouletteManager.removeUserFromAllRooms(socket.id);
      await eventManager.removeUserFromAllEvents(socket.id);
      await rouletteManager.removeUser(socket.id);
    } catch (err) {
      console.error('Disconnect cleanup error:', err);
    }
  });

  // ============ PROFILE DISCOVERY & MATCHING ============

  // Save/update profile (called on register and profile update)
  socket.on('save_profile', async (data) => {
    try {
      const profile = await profileManager.saveProfile(socket.id, data);
      socket.emit('profile_saved', { profile });
    } catch (err) {
      console.error('Save profile error:', err);
      socket.emit('error', { message: 'Failed to save profile' });
    }
  });

  // Browse profiles
  socket.on('browse_profiles', async (filters = {}) => {
    try {
      const result = await profileManager.browseProfiles(socket.id, filters);
      socket.emit('profiles_list', { 
        activeProfiles: result.active,
        inactiveProfiles: result.inactive,
        totalActive: result.totalActive,
        totalInactive: result.totalInactive
      });
    } catch (err) {
      console.error('Browse profiles error:', err);
      socket.emit('error', { message: 'Failed to load profiles' });
    }
  });

  // Like a profile
  socket.on('like_profile', async ({ userId }) => {
    try {
      const result = await profileManager.likeProfile(socket.id, userId);
      socket.emit('like_result', result);
      
      // Track like stat
      if (result.success) {
        await statsManager.trackLike();
      }
      
      if (result.isMatch) {
        // Track match stat
        await statsManager.trackMatch();
        
        // Notify both users of the match
        const myProfile = await profileManager.getProfile(socket.id);
        const theirProfile = await profileManager.getProfile(userId);
        
        socket.emit('new_match', { profile: theirProfile });
        io.to(userId).emit('new_match', { profile: myProfile });
      } else if (result.success) {
        // Notify the other user they received a like
        const myProfile = await profileManager.getProfile(socket.id);
        io.to(userId).emit('new_like', { profile: myProfile });
      }
    } catch (err) {
      console.error('Like profile error:', err);
      socket.emit('error', { message: 'Failed to like profile' });
    }
  });

  // Get likes received
  socket.on('get_likes', async () => {
    try {
      const likes = await profileManager.getLikesReceived(socket.id);
      socket.emit('likes_list', { likes });
    } catch (err) {
      console.error('Get likes error:', err);
      socket.emit('error', { message: 'Failed to get likes' });
    }
  });

  // Remove a like (reject)
  socket.on('remove_like', async ({ userId }) => {
    try {
      await profileManager.removeLike(socket.id, userId);
      socket.emit('like_removed', { userId });
    } catch (err) {
      console.error('Remove like error:', err);
    }
  });

  // Like back (creates a match)
  socket.on('like_back', async ({ userId }) => {
    try {
      const result = await profileManager.likeProfile(socket.id, userId);
      
      if (result.isMatch) {
        const myProfile = await profileManager.getProfile(socket.id);
        const theirProfile = await profileManager.getProfile(userId);
        
        socket.emit('new_match', { profile: theirProfile });
        io.to(userId).emit('new_match', { profile: myProfile });
      }
    } catch (err) {
      console.error('Like back error:', err);
    }
  });

  // Get matches
  socket.on('get_matches', async () => {
    try {
      const matches = await profileManager.getMatches(socket.id);
      socket.emit('matches_list', { matches });
    } catch (err) {
      console.error('Get matches error:', err);
      socket.emit('error', { message: 'Failed to get matches' });
    }
  });

  // Unmatch
  socket.on('unmatch', async ({ userId }) => {
    try {
      await profileManager.unmatch(socket.id, userId);
      socket.emit('unmatched', { userId });
      io.to(userId).emit('unmatched', { userId: socket.id });
    } catch (err) {
      console.error('Unmatch error:', err);
    }
  });

  // Schedule a chat with match
  socket.on('schedule_chat', async ({ matchId, scheduledTime, duration }) => {
    try {
      const result = await profileManager.scheduleChat(socket.id, matchId, scheduledTime, duration);
      
      if (result.success) {
        const myProfile = await profileManager.getProfile(socket.id);
        socket.emit('chat_scheduled', result.chat);
        io.to(matchId).emit('chat_scheduled', { ...result.chat, scheduledBy: myProfile });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (err) {
      console.error('Schedule chat error:', err);
      socket.emit('error', { message: 'Failed to schedule chat' });
    }
  });

  // Cancel scheduled chat
  socket.on('cancel_scheduled_chat', async ({ matchId, chatId }) => {
    try {
      await profileManager.cancelChat(socket.id, matchId, chatId);
      socket.emit('chat_cancelled', { chatId });
      io.to(matchId).emit('chat_cancelled', { chatId });
    } catch (err) {
      console.error('Cancel chat error:', err);
    }
  });

  // ============ PROFILE VIEWS ============

  // Record profile view
  socket.on('view_profile', async ({ userId }) => {
    try {
      const viewerId = await getUserIdFromSocket(socket.id);
      await profileManager.recordProfileView(viewerId, userId);
    } catch (err) {
      console.error('View profile error:', err);
    }
  });

  // Get who viewed my profile
  socket.on('get_profile_views', async () => {
    try {
      const odditionalMaterials = await getUserIdFromSocket(socket.id);
      const views = await profileManager.getProfileViews(userId);
      socket.emit('profile_views', { views });
    } catch (err) {
      console.error('Get views error:', err);
    }
  });

  // Get featured profiles (multiple, with gender filter)
  socket.on('get_featured_profiles', async ({ gender } = {}) => {
    try {
      const profiles = await profileManager.getFeaturedProfiles(socket.id, gender, 10);
      socket.emit('featured_profiles', { profiles });
    } catch (err) {
      console.error('Get featured error:', err);
    }
  });

  // ============ REPORTS ============

  // Report a user
  socket.on('report_user', async ({ userId, reason }) => {
    try {
      const result = await profileManager.reportUser(socket.id, userId, reason);
      socket.emit('report_submitted', result);
      
      // Notify admin if flagged (10+ reports)
      if (result.flagged) {
        io.emit('user_flagged', { userId, reportCount: result.reportCount });
      }
    } catch (err) {
      console.error('Report error:', err);
    }
  });

  // ============ DELETE PROFILE ============

  socket.on('delete_my_profile', async () => {
    try {
      await profileManager.deleteProfile(socket.id);
      await rouletteManager.removeUser(socket.id);
      socket.emit('profile_deleted', { success: true });
    } catch (err) {
      console.error('Delete profile error:', err);
    }
  });

  // ============ ADMIN FUNCTIONS ============

  // Get all users (admin only)
  socket.on('admin_get_users', async () => {
    try {
      if (!rouletteManager.isAdmin(socket.id)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      const users = await profileManager.getAllUsers();
      socket.emit('admin_users', { users });
    } catch (err) {
      console.error('Admin get users error:', err);
    }
  });

  // Get all reports (admin only)
  socket.on('admin_get_reports', async () => {
    try {
      if (!rouletteManager.isAdmin(socket.id)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      const reports = await profileManager.getAllReports();
      const flagged = await profileManager.getFlaggedUsers();
      socket.emit('admin_reports', { reports, flagged });
    } catch (err) {
      console.error('Admin get reports error:', err);
    }
  });

  // Delete user (admin only)
  socket.on('admin_delete_user', async ({ userId }) => {
    try {
      if (!rouletteManager.isAdmin(socket.id)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      await profileManager.deleteProfile(userId);
      socket.emit('admin_user_deleted', { userId });
    } catch (err) {
      console.error('Admin delete user error:', err);
    }
  });

  // Get global stats (admin only)
  socket.on('admin_get_stats', async () => {
    try {
      if (!rouletteManager.isAdmin(socket.id)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      const globalStats = await statsManager.getGlobalStats();
      const dailyStats = await statsManager.getStatsRange(30);
      const emailCount = await statsManager.getEmailCount();
      const activeUsers = await statsManager.getActiveUsers();
      
      socket.emit('admin_stats', { 
        global: globalStats, 
        daily: dailyStats,
        emailCount,
        activeUsers
      });
    } catch (err) {
      console.error('Admin get stats error:', err);
    }
  });

  // Export email list (admin only)
  socket.on('admin_export_emails', async () => {
    try {
      if (!rouletteManager.isAdmin(socket.id)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      const csv = await statsManager.exportEmailsCSV();
      const emails = await statsManager.getEmailList();
      socket.emit('admin_emails', { csv, emails, count: emails.length });
    } catch (err) {
      console.error('Admin export emails error:', err);
    }
  });

  // ============ INVITES ============

  socket.on('track_invite', async ({ inviterId }) => {
    try {
      const count = await profileManager.trackInvite(inviterId, socket.id);
      io.to(inviterId).emit('invite_tracked', { count });
    } catch (err) {
      console.error('Track invite error:', err);
    }
  });

  socket.on('get_invite_count', async () => {
    try {
      const count = await profileManager.getInviteCount(socket.id);
      socket.emit('invite_count', { count });
    } catch (err) {
      console.error('Get invite count error:', err);
    }
  });
});

// Periodic queue matching (catches edge cases)
setInterval(async () => {
  if (rouletteManager) {
    try {
      const result = await rouletteManager.tryMatch();
      if (result.success) {
        const user1 = await rouletteManager.getUser(result.user1);
        const user2 = await rouletteManager.getUser(result.user2);

        const socket1 = io.sockets.sockets.get(result.user1);
        const socket2 = io.sockets.sockets.get(result.user2);

        if (socket1) socket1.join(result.sessionId);
        if (socket2) socket2.join(result.sessionId);

        io.to(result.sessionId).emit('match_found', {
          sessionId: result.sessionId,
          duration: result.duration,
          users: {
            [result.user1]: user1,
            [result.user2]: user2
          }
        });
      }
    } catch (err) {
      // Silently handle - this is just a backup matcher
    }
  }
}, 2000);

// Start server
async function start() {
  try {
    await initRedis();
    
    // Initialize default chat rooms
    await rouletteManager.initDefaultRooms();
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Redis connected`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
