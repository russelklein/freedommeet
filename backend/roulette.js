/**
 * Roulette Matching Logic & Room Management
 * Handles queue management, pairing users, session state, and chat rooms
 */

const ROULETTE_DURATION = 180; // 3 minutes in seconds
const PRIVATE_CHAT_DURATION = 300; // 5 minutes in seconds
const EXTEND_DURATION = 300; // 5 more minutes when both extend

// Default rooms that always exist (can be modified by admin)
const DEFAULT_ROOMS = [
  { id: 'general', name: 'General Chat', description: 'Welcome! Say hi and meet new people', icon: '👋', isDefault: true },
  { id: 'news', name: 'News & Politics', description: 'Discuss current events and news', icon: '📰', isDefault: true },
  { id: 'science', name: 'Science & Health', description: 'Science, health, and wellness topics', icon: '🔬', isDefault: true }
];

// Admin password from environment variable (set in Render)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FreedomAdmin2024!';

class RouletteManager {
  constructor(redisClient, io) {
    this.redis = redisClient;
    this.io = io;
    this.timers = new Map(); // sessionId -> timer interval
    this.adminSessions = new Set(); // Track authenticated admin sessions
  }

  // Check if user is admin (must be authenticated)
  isAdmin(socketId) {
    return this.adminSessions.has(socketId);
  }

  // Authenticate admin with password
  authenticateAdmin(socketId, password) {
    if (password === ADMIN_PASSWORD) {
      this.adminSessions.add(socketId);
      return true;
    }
    return false;
  }

  // Remove admin session on disconnect
  removeAdminSession(socketId) {
    this.adminSessions.delete(socketId);
  }

  // Keys
  userKey(visitorSessionId) { return `user:${visitorSessionId}`; }
  sessionKey(sessionId) { return `session:${sessionId}`; }
  likesKey(sessionId) { return `likes:${sessionId}`; }
  privateChatKey(chatId) { return `private:${chatId}`; }
  extendKey(chatId) { return `extend:${chatId}`; }

  // Add user to system
  async addUser(socketId, userData) {
    await this.redis.set(
      this.userKey(socketId),
      JSON.stringify(userData),
      { EX: 3600 } // 1 hour expiry
    );
  }

  // Remove user from system
  async removeUser(socketId) {
    await this.redis.del(this.userKey(socketId));
    await this.leaveQueue(socketId);
  }

  // Get user data
  async getUser(socketId) {
    const data = await this.redis.get(this.userKey(socketId));
    return data ? JSON.parse(data) : null;
  }

  // Join the roulette queue (gender-based matching)
  async joinQueue(socketId) {
    const user = await this.getUser(socketId);
    if (!user || !user.gender) {
      return { success: false, reason: 'gender_required' };
    }

    const queueKey = user.gender === 'male' ? 'queue:roulette:male' : 'queue:roulette:female';
    
    // Check if already in queue
    const maleQueue = await this.redis.lRange('queue:roulette:male', 0, -1);
    const femaleQueue = await this.redis.lRange('queue:roulette:female', 0, -1);
    if (maleQueue.includes(socketId) || femaleQueue.includes(socketId)) {
      return { success: false, reason: 'already_in_queue' };
    }

    // Add to appropriate queue
    await this.redis.rPush(queueKey, socketId);
    
    // Try to find a match
    return await this.tryMatch();
  }

  // Leave the queue
  async leaveQueue(socketId) {
    await this.redis.lRem('queue:roulette:male', 0, socketId);
    await this.redis.lRem('queue:roulette:female', 0, socketId);
  }

  // Try to match two users (only male with female)
  async tryMatch() {
    const maleQueue = await this.redis.lRange('queue:roulette:male', 0, -1);
    const femaleQueue = await this.redis.lRange('queue:roulette:female', 0, -1);
    
    if (maleQueue.length < 1 || femaleQueue.length < 1) {
      return { success: false, reason: 'waiting', queuePosition: maleQueue.length + femaleQueue.length };
    }

    // Get one from each queue
    const maleSocketId = await this.redis.lPop('queue:roulette:male');
    const femaleSocketId = await this.redis.lPop('queue:roulette:female');

    if (!maleSocketId || !femaleSocketId) {
      // Put back if only got one
      if (maleSocketId) await this.redis.lPush('queue:roulette:male', maleSocketId);
      if (femaleSocketId) await this.redis.lPush('queue:roulette:female', femaleSocketId);
      return { success: false, reason: 'waiting' };
    }

    // Create session
    const sessionId = `roulette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      user1: maleSocketId,
      user2: femaleSocketId,
      startedAt: Date.now(),
      expiresAt: Date.now() + (ROULETTE_DURATION * 1000)
    };

    await this.redis.set(
      this.sessionKey(sessionId),
      JSON.stringify(session),
      { EX: ROULETTE_DURATION + 60 } // Extra minute buffer
    );

    // Initialize likes as empty
    await this.redis.del(this.likesKey(sessionId));

    // Start timer
    this.startSessionTimer(sessionId, ROULETTE_DURATION);

    return { 
      success: true, 
      sessionId, 
      user1: maleSocketId, 
      user2: femaleSocketId,
      duration: ROULETTE_DURATION
    };
  }

  // Start countdown timer for a session
  startSessionTimer(sessionId, duration) {
    let remaining = duration;

    const interval = setInterval(async () => {
      remaining--;

      // Broadcast time update
      this.io.to(sessionId).emit('timer_update', { 
        sessionId, 
        remaining,
        type: 'roulette'
      });

      if (remaining <= 0) {
        clearInterval(interval);
        this.timers.delete(sessionId);
        await this.endRouletteSession(sessionId, 'timeout');
      }
    }, 1000);

    this.timers.set(sessionId, interval);
  }

  // User clicks like
  async registerLike(sessionId, socketId) {
    await this.redis.sAdd(this.likesKey(sessionId), socketId);
    
    // Check for mutual like
    const session = await this.getSession(sessionId);
    if (!session) return { mutual: false };

    const likes = await this.redis.sMembers(this.likesKey(sessionId));
    const mutual = likes.includes(session.user1) && likes.includes(session.user2);

    return { mutual, likes };
  }

  // Get session data
  async getSession(sessionId) {
    const data = await this.redis.get(this.sessionKey(sessionId));
    return data ? JSON.parse(data) : null;
  }

  // End roulette session
  async endRouletteSession(sessionId, reason) {
    // Clear timer if exists
    if (this.timers.has(sessionId)) {
      clearInterval(this.timers.get(sessionId));
      this.timers.delete(sessionId);
    }

    const session = await this.getSession(sessionId);
    if (!session) return;

    // Check for mutual like
    const likes = await this.redis.sMembers(this.likesKey(sessionId));
    const mutual = likes.includes(session.user1) && likes.includes(session.user2);

    // Notify users
    this.io.to(sessionId).emit('roulette_ended', {
      sessionId,
      reason,
      mutual
    });

    // Clean up
    await this.redis.del(this.sessionKey(sessionId));
    await this.redis.del(this.likesKey(sessionId));
  }

  // Skip current match and find new one
  async skipMatch(sessionId, socketId) {
    const session = await this.getSession(sessionId);
    if (!session) return;

    // End current session
    await this.endRouletteSession(sessionId, 'skipped');

    // Put both users back in queue
    await this.joinQueue(session.user1);
    await this.joinQueue(session.user2);
  }

  // Create private chat from mutual like
  async createPrivateChat(user1SocketId, user2SocketId) {
    const chatId = `private_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chat = {
      id: chatId,
      user1: user1SocketId,
      user2: user2SocketId,
      startedAt: Date.now(),
      expiresAt: Date.now() + (PRIVATE_CHAT_DURATION * 1000)
    };

    await this.redis.set(
      this.privateChatKey(chatId),
      JSON.stringify(chat),
      { EX: PRIVATE_CHAT_DURATION + 60 }
    );

    // Initialize extend votes
    await this.redis.del(this.extendKey(chatId));

    // Start timer
    this.startPrivateChatTimer(chatId, PRIVATE_CHAT_DURATION);

    return { chatId, duration: PRIVATE_CHAT_DURATION };
  }

  // Start private chat timer
  startPrivateChatTimer(chatId, duration) {
    let remaining = duration;

    const interval = setInterval(async () => {
      remaining--;

      this.io.to(chatId).emit('timer_update', { 
        chatId, 
        remaining,
        type: 'private'
      });

      if (remaining <= 0) {
        clearInterval(interval);
        this.timers.delete(chatId);
        await this.endPrivateChat(chatId, 'timeout');
      }
    }, 1000);

    this.timers.set(chatId, interval);
  }

  // User votes to extend private chat
  async voteExtend(chatId, socketId) {
    await this.redis.sAdd(this.extendKey(chatId), socketId);

    const chat = await this.getPrivateChat(chatId);
    if (!chat) return { extended: false };

    const votes = await this.redis.sMembers(this.extendKey(chatId));
    const bothVoted = votes.includes(chat.user1) && votes.includes(chat.user2);

    if (bothVoted) {
      // Extend the chat
      await this.extendPrivateChat(chatId);
      return { extended: true };
    }

    return { extended: false, votedCount: votes.length };
  }

  // Extend private chat duration
  async extendPrivateChat(chatId) {
    // Clear current timer
    if (this.timers.has(chatId)) {
      clearInterval(this.timers.get(chatId));
      this.timers.delete(chatId);
    }

    // Update chat expiry
    const chat = await this.getPrivateChat(chatId);
    if (!chat) return;

    chat.expiresAt = Date.now() + (EXTEND_DURATION * 1000);
    await this.redis.set(
      this.privateChatKey(chatId),
      JSON.stringify(chat),
      { EX: EXTEND_DURATION + 60 }
    );

    // Clear extend votes for next round
    await this.redis.del(this.extendKey(chatId));

    // Start new timer
    this.startPrivateChatTimer(chatId, EXTEND_DURATION);

    // Notify users
    this.io.to(chatId).emit('chat_extended', {
      chatId,
      newDuration: EXTEND_DURATION
    });
  }

  // Get private chat data
  async getPrivateChat(chatId) {
    const data = await this.redis.get(this.privateChatKey(chatId));
    return data ? JSON.parse(data) : null;
  }

  // End private chat
  async endPrivateChat(chatId, reason) {
    if (this.timers.has(chatId)) {
      clearInterval(this.timers.get(chatId));
      this.timers.delete(chatId);
    }

    this.io.to(chatId).emit('private_chat_ended', {
      chatId,
      reason
    });

    await this.redis.del(this.privateChatKey(chatId));
    await this.redis.del(this.extendKey(chatId));
  }

  // Get queue status
  async getQueueStatus() {
    const queue = await this.redis.lRange('queue:roulette', 0, -1);
    return { count: queue.length };
  }

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  roomKey(roomId) { return `room:${roomId}`; }
  roomMembersKey(roomId) { return `room:${roomId}:members`; }
  roomMessagesKey(roomId) { return `room:${roomId}:messages`; }
  roomBansKey(roomId) { return `room:${roomId}:bans`; }
  userRoomsKey(visitorSessionId) { return `user:${visitorSessionId}:rooms`; }

  // Initialize default rooms on startup
  async initDefaultRooms() {
    for (const room of DEFAULT_ROOMS) {
      const exists = await this.redis.exists(this.roomKey(room.id));
      if (!exists) {
        await this.redis.set(
          this.roomKey(room.id),
          JSON.stringify({
            ...room,
            createdAt: Date.now(),
            creatorId: 'system',
            isDefault: true
          })
        );
      }
    }
    console.log('Default rooms initialized');
  }

  // Get all rooms (default + user-created)
  async getAllRooms() {
    const keys = await this.redis.keys('room:*');
    const roomKeys = keys.filter(k => !k.includes(':members') && !k.includes(':messages') && !k.includes(':bans'));
    
    const rooms = [];
    for (const key of roomKeys) {
      const data = await this.redis.get(key);
      if (data) {
        const room = JSON.parse(data);
        // Get member count
        const memberCount = await this.redis.sCard(this.roomMembersKey(room.id));
        rooms.push({ ...room, memberCount });
      }
    }
    
    // Sort: default rooms first, then by member count
    rooms.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.memberCount - a.memberCount;
    });
    
    return rooms;
  }

  // Create a new room
  async createRoom(creatorSocketId, roomData) {
    const creator = await this.getUser(creatorSocketId);
    if (!creator) {
      return { success: false, error: 'User not found' };
    }

    const roomId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const room = {
      id: roomId,
      name: roomData.name.slice(0, 50),
      description: roomData.description?.slice(0, 200) || '',
      icon: roomData.icon || '💬',
      isDefault: false,
      creatorId: creatorSocketId,
      creatorName: creator.name,
      createdAt: Date.now(),
      isPrivate: roomData.isPrivate || false
    };

    await this.redis.set(
      this.roomKey(roomId),
      JSON.stringify(room),
      { EX: 86400 * 7 } // Rooms expire after 7 days of no activity
    );

    // Creator automatically joins and becomes moderator
    await this.joinRoom(creatorSocketId, roomId);

    return { success: true, room };
  }

  // Get room details
  async getRoom(roomId) {
    const data = await this.redis.get(this.roomKey(roomId));
    if (!data) return null;
    
    const room = JSON.parse(data);
    const memberCount = await this.redis.sCard(this.roomMembersKey(roomId));
    const members = await this.getRoomMembers(roomId);
    
    return { ...room, memberCount, members };
  }

  // Join a room
  async joinRoom(socketId, roomId) {
    const user = await this.getUser(socketId);
    const room = await this.getRoom(roomId);
    
    if (!user) return { success: false, error: 'User not found' };
    if (!room) return { success: false, error: 'Room not found' };
    
    // Check if banned
    const isBanned = await this.redis.sIsMember(this.roomBansKey(roomId), socketId);
    if (isBanned) {
      return { success: false, error: 'You are banned from this room' };
    }

    // Add user to room members
    await this.redis.sAdd(this.roomMembersKey(roomId), socketId);
    
    // Track which rooms user is in
    await this.redis.sAdd(this.userRoomsKey(socketId), roomId);
    
    // Refresh room expiry
    await this.redis.expire(this.roomKey(roomId), 86400 * 7);

    return { success: true, room };
  }

  // Leave a room
  async leaveRoom(socketId, roomId) {
    await this.redis.sRem(this.roomMembersKey(roomId), socketId);
    await this.redis.sRem(this.userRoomsKey(socketId), roomId);
    
    return { success: true };
  }

  // Get room members with user data
  async getRoomMembers(roomId) {
    const memberIds = await this.redis.sMembers(this.roomMembersKey(roomId));
    const members = [];
    
    for (const id of memberIds) {
      const user = await this.getUser(id);
      if (user) {
        members.push(user);
      } else {
        // Clean up stale member
        await this.redis.sRem(this.roomMembersKey(roomId), id);
      }
    }
    
    return members;
  }

  // Check if user is room creator/moderator
  async isRoomModerator(socketId, roomId) {
    const room = await this.getRoom(roomId);
    if (!room) return false;
    return room.creatorId === socketId || room.isDefault === false && room.creatorId === socketId;
  }

  // Kick user from room (moderator only)
  async kickUser(moderatorSocketId, targetSocketId, roomId) {
    const isMod = await this.isRoomModerator(moderatorSocketId, roomId);
    if (!isMod) {
      return { success: false, error: 'Not authorized' };
    }

    await this.leaveRoom(targetSocketId, roomId);
    
    return { success: true, kicked: targetSocketId };
  }

  // Ban user from room (moderator only)
  async banUser(moderatorSocketId, targetSocketId, roomId) {
    const isMod = await this.isRoomModerator(moderatorSocketId, roomId);
    if (!isMod) {
      return { success: false, error: 'Not authorized' };
    }

    // Remove from room
    await this.leaveRoom(targetSocketId, roomId);
    
    // Add to ban list
    await this.redis.sAdd(this.roomBansKey(roomId), targetSocketId);
    await this.redis.expire(this.roomBansKey(roomId), 86400 * 7); // Bans last 7 days
    
    return { success: true, banned: targetSocketId };
  }

  // Unban user (moderator only)
  async unbanUser(moderatorSocketId, targetSocketId, roomId) {
    const isMod = await this.isRoomModerator(moderatorSocketId, roomId);
    if (!isMod) {
      return { success: false, error: 'Not authorized' };
    }

    await this.redis.sRem(this.roomBansKey(roomId), targetSocketId);
    
    return { success: true, unbanned: targetSocketId };
  }

  // Delete room (creator only, not default rooms)
  async deleteRoom(socketId, roomId) {
    const room = await this.getRoom(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    
    const isAdmin = this.isAdmin(socketId);
    
    // Allow admin to delete any room, creator to delete their own
    if (room.isDefault && !isAdmin) {
      return { success: false, error: 'Only admin can delete default rooms' };
    }
    if (!room.isDefault && room.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    // Clean up all room data
    await this.redis.del(this.roomKey(roomId));
    await this.redis.del(this.roomMembersKey(roomId));
    await this.redis.del(this.roomBansKey(roomId));

    return { success: true };
  }

  // Update room (admin only for default rooms, creator for custom)
  async updateRoom(socketId, roomId, updates) {
    const room = await this.getRoom(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    const isAdmin = this.isAdmin(socketId);

    // Check permissions
    if (room.isDefault && !isAdmin) {
      return { success: false, error: 'Only admin can edit default rooms' };
    }
    if (!room.isDefault && room.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    // Update allowed fields
    const updatedRoom = {
      ...room,
      name: updates.name?.slice(0, 50) || room.name,
      description: updates.description?.slice(0, 200) || room.description,
      icon: updates.icon || room.icon,
      updatedAt: Date.now()
    };

    await this.redis.set(
      this.roomKey(roomId),
      JSON.stringify(updatedRoom)
    );

    return { success: true, room: updatedRoom };
  }

  // Admin: Create a new default room
  async createDefaultRoom(socketId, roomData) {
    const isAdmin = this.isAdmin(socketId);
    if (!isAdmin) {
      return { success: false, error: 'Only admin can create default rooms' };
    }

    const roomId = roomData.id || `default_${Date.now()}`;
    
    const room = {
      id: roomId,
      name: roomData.name.slice(0, 50),
      description: roomData.description?.slice(0, 200) || '',
      icon: roomData.icon || '💬',
      isDefault: true,
      creatorId: 'system',
      createdAt: Date.now()
    };

    await this.redis.set(
      this.roomKey(roomId),
      JSON.stringify(room)
    );

    return { success: true, room };
  }

  // Clean up user from all rooms on disconnect
  async removeUserFromAllRooms(socketId) {
    const roomIds = await this.redis.sMembers(this.userRoomsKey(socketId));
    
    for (const roomId of roomIds) {
      await this.redis.sRem(this.roomMembersKey(roomId), socketId);
    }
    
    await this.redis.del(this.userRoomsKey(socketId));
  }
}

module.exports = { RouletteManager, DEFAULT_ROOMS, ROULETTE_DURATION, PRIVATE_CHAT_DURATION };
