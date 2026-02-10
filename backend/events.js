/**
 * Event Management System
 * Handles speaker events, RSVPs, Q&A, and live event rooms
 */

class EventManager {
  constructor(redis, io) {
    this.redis = redis;
    this.io = io;
  }

  // Redis keys
  eventKey(eventId) { return `event:${eventId}`; }
  eventsListKey() { return 'events:all'; }
  eventRsvpsKey(eventId) { return `event:${eventId}:rsvps`; }
  eventAttendeesKey(eventId) { return `event:${eventId}:attendees`; }
  eventQuestionsKey(eventId) { return `event:${eventId}:questions`; }
  eventMessagesKey(eventId) { return `event:${eventId}:messages`; }
  eventStatsKey(eventId) { return `event:${eventId}:stats`; }

  // ============================================
  // EVENT CRUD
  // ============================================

  async createEvent(creatorSocketId, eventData, userGetter) {
    const creator = await userGetter(creatorSocketId);
    if (!creator) {
      return { success: false, error: 'User not found' };
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const event = {
      id: eventId,
      title: eventData.title?.slice(0, 100) || 'Untitled Event',
      description: eventData.description?.slice(0, 1000) || '',
      speakerName: eventData.speakerName?.slice(0, 100) || creator.name,
      speakerBio: eventData.speakerBio?.slice(0, 500) || '',
      speakerPhoto: eventData.speakerPhoto || creator.photo,
      videoUrl: eventData.videoUrl || '', // YouTube/Zoom link
      videoType: eventData.videoType || 'youtube', // youtube, zoom, or custom
      scheduledAt: eventData.scheduledAt || Date.now(),
      duration: eventData.duration || 60, // minutes
      status: 'scheduled', // scheduled, live, ended
      creatorId: creatorSocketId,
      creatorName: creator.name,
      createdAt: Date.now(),
      maxAttendees: eventData.maxAttendees || 1000,
      isPublic: eventData.isPublic !== false,
      tags: eventData.tags || [],
      thumbnail: eventData.thumbnail || ''
    };

    // Save event
    await this.redis.set(this.eventKey(eventId), JSON.stringify(event));
    
    // Add to events list
    await this.redis.zAdd(this.eventsListKey(), {
      score: event.scheduledAt,
      value: eventId
    });

    // Initialize stats
    await this.redis.set(this.eventStatsKey(eventId), JSON.stringify({
      rsvpCount: 0,
      peakAttendees: 0,
      totalMessages: 0,
      totalQuestions: 0
    }));

    return { success: true, event };
  }

  async updateEvent(socketId, eventId, updates, isAdminChecker) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const isAdmin = await isAdminChecker(socketId);
    if (event.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    const updatedEvent = {
      ...event,
      title: updates.title?.slice(0, 100) || event.title,
      description: updates.description?.slice(0, 1000) || event.description,
      speakerName: updates.speakerName?.slice(0, 100) || event.speakerName,
      speakerBio: updates.speakerBio?.slice(0, 500) || event.speakerBio,
      speakerPhoto: updates.speakerPhoto || event.speakerPhoto,
      videoUrl: updates.videoUrl || event.videoUrl,
      videoType: updates.videoType || event.videoType,
      scheduledAt: updates.scheduledAt || event.scheduledAt,
      duration: updates.duration || event.duration,
      thumbnail: updates.thumbnail || event.thumbnail,
      updatedAt: Date.now()
    };

    await this.redis.set(this.eventKey(eventId), JSON.stringify(updatedEvent));

    // Update sort order if date changed
    if (updates.scheduledAt) {
      await this.redis.zAdd(this.eventsListKey(), {
        score: updates.scheduledAt,
        value: eventId
      });
    }

    return { success: true, event: updatedEvent };
  }

  async deleteEvent(socketId, eventId, isAdminChecker) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const isAdmin = await isAdminChecker(socketId);
    if (event.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    // Clean up all event data
    await this.redis.del(this.eventKey(eventId));
    await this.redis.del(this.eventRsvpsKey(eventId));
    await this.redis.del(this.eventAttendeesKey(eventId));
    await this.redis.del(this.eventQuestionsKey(eventId));
    await this.redis.del(this.eventStatsKey(eventId));
    await this.redis.zRem(this.eventsListKey(), eventId);

    return { success: true };
  }

  async getEvent(eventId) {
    const data = await this.redis.get(this.eventKey(eventId));
    if (!data) return null;

    const event = JSON.parse(data);
    
    // Get RSVP and attendee counts
    const rsvpCount = await this.redis.sCard(this.eventRsvpsKey(eventId));
    const attendeeCount = await this.redis.sCard(this.eventAttendeesKey(eventId));
    const stats = await this.getEventStats(eventId);

    return { ...event, rsvpCount, attendeeCount, stats };
  }

  async getAllEvents(includeEnded = false) {
    const now = Date.now();
    let eventIds;
    
    if (includeEnded) {
      // Get all events
      eventIds = await this.redis.zRange(this.eventsListKey(), 0, -1);
    } else {
      // Get upcoming and live events (scheduled in last 24 hours or future)
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      eventIds = await this.redis.zRangeByScore(this.eventsListKey(), oneDayAgo, '+inf');
    }

    const events = [];
    for (const eventId of eventIds) {
      const event = await this.getEvent(eventId);
      if (event) {
        events.push(event);
      }
    }

    // Sort by date (upcoming first)
    events.sort((a, b) => a.scheduledAt - b.scheduledAt);

    return events;
  }

  async getUpcomingEvents(limit = 10) {
    const now = Date.now();
    const eventIds = await this.redis.zRangeByScore(this.eventsListKey(), now, '+inf', {
      LIMIT: { offset: 0, count: limit }
    });

    const events = [];
    for (const eventId of eventIds) {
      const event = await this.getEvent(eventId);
      if (event && event.status !== 'ended') {
        events.push(event);
      }
    }

    return events;
  }

  // ============================================
  // RSVP SYSTEM
  // ============================================

  async rsvpToEvent(socketId, eventId, userGetter) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const user = await userGetter(socketId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check capacity
    const rsvpCount = await this.redis.sCard(this.eventRsvpsKey(eventId));
    if (rsvpCount >= event.maxAttendees) {
      return { success: false, error: 'Event is full' };
    }

    // Add RSVP
    await this.redis.sAdd(this.eventRsvpsKey(eventId), socketId);

    // Update stats
    await this.updateEventStats(eventId, { rsvpCount: rsvpCount + 1 });

    return { success: true, rsvpCount: rsvpCount + 1 };
  }

  async cancelRsvp(socketId, eventId) {
    await this.redis.sRem(this.eventRsvpsKey(eventId), socketId);
    
    const rsvpCount = await this.redis.sCard(this.eventRsvpsKey(eventId));
    await this.updateEventStats(eventId, { rsvpCount });

    return { success: true, rsvpCount };
  }

  async hasRsvp(socketId, eventId) {
    return await this.redis.sIsMember(this.eventRsvpsKey(eventId), socketId);
  }

  async getRsvpList(eventId) {
    return await this.redis.sMembers(this.eventRsvpsKey(eventId));
  }

  // ============================================
  // LIVE EVENT ROOM
  // ============================================

  async startEvent(socketId, eventId, isAdminChecker) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const isAdmin = await isAdminChecker(socketId);
    if (event.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    const updatedEvent = { ...event, status: 'live', startedAt: Date.now() };
    await this.redis.set(this.eventKey(eventId), JSON.stringify(updatedEvent));

    // Notify all RSVPs that event is starting
    this.io.emit('event_started', { eventId, event: updatedEvent });

    return { success: true, event: updatedEvent };
  }

  async endEvent(socketId, eventId, isAdminChecker) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const isAdmin = await isAdminChecker(socketId);
    if (event.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    const updatedEvent = { ...event, status: 'ended', endedAt: Date.now() };
    await this.redis.set(this.eventKey(eventId), JSON.stringify(updatedEvent));

    // Notify attendees
    this.io.to(`event_${eventId}`).emit('event_ended', { eventId });

    return { success: true, event: updatedEvent };
  }

  async joinEventRoom(socketId, eventId, userGetter) {
    const event = await this.getEvent(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const user = await userGetter(socketId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Add to attendees
    await this.redis.sAdd(this.eventAttendeesKey(eventId), socketId);

    // Update peak attendance
    const attendeeCount = await this.redis.sCard(this.eventAttendeesKey(eventId));
    const stats = await this.getEventStats(eventId);
    if (attendeeCount > (stats.peakAttendees || 0)) {
      await this.updateEventStats(eventId, { peakAttendees: attendeeCount });
    }

    return { success: true, event, attendeeCount };
  }

  async leaveEventRoom(socketId, eventId) {
    await this.redis.sRem(this.eventAttendeesKey(eventId), socketId);
    const attendeeCount = await this.redis.sCard(this.eventAttendeesKey(eventId));
    return { success: true, attendeeCount };
  }

  async getEventAttendees(eventId, userGetter) {
    const attendeeIds = await this.redis.sMembers(this.eventAttendeesKey(eventId));
    const attendees = [];
    
    for (const id of attendeeIds) {
      const user = await userGetter(id);
      if (user) {
        attendees.push(user);
      }
    }
    
    return attendees;
  }

  // ============================================
  // Q&A SYSTEM
  // ============================================

  async submitQuestion(socketId, eventId, questionText, userGetter) {
    const user = await userGetter(socketId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const question = {
      id: questionId,
      eventId,
      askerId: socketId,
      askerName: user.name,
      askerPhoto: user.photo,
      text: questionText.slice(0, 500),
      status: 'pending', // pending, approved, answered, dismissed
      upvotes: 0,
      upvoters: [],
      createdAt: Date.now()
    };

    // Add to questions list (sorted by time)
    await this.redis.zAdd(this.eventQuestionsKey(eventId), {
      score: Date.now(),
      value: JSON.stringify(question)
    });

    // Update stats
    const stats = await this.getEventStats(eventId);
    await this.updateEventStats(eventId, { totalQuestions: (stats.totalQuestions || 0) + 1 });

    return { success: true, question };
  }

  async getQuestions(eventId, status = null) {
    const questionsData = await this.redis.zRange(this.eventQuestionsKey(eventId), 0, -1);
    
    let questions = questionsData.map(q => JSON.parse(q));
    
    if (status) {
      questions = questions.filter(q => q.status === status);
    }

    // Sort by upvotes (highest first), then by time
    questions.sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return a.createdAt - b.createdAt;
    });

    return questions;
  }

  async upvoteQuestion(socketId, eventId, questionId) {
    const questionsData = await this.redis.zRange(this.eventQuestionsKey(eventId), 0, -1);
    
    for (let i = 0; i < questionsData.length; i++) {
      const question = JSON.parse(questionsData[i]);
      if (question.id === questionId) {
        // Check if already upvoted
        if (question.upvoters.includes(socketId)) {
          return { success: false, error: 'Already upvoted' };
        }

        // Update question
        question.upvotes += 1;
        question.upvoters.push(socketId);

        // Remove old and add updated
        await this.redis.zRem(this.eventQuestionsKey(eventId), questionsData[i]);
        await this.redis.zAdd(this.eventQuestionsKey(eventId), {
          score: question.createdAt,
          value: JSON.stringify(question)
        });

        return { success: true, question };
      }
    }

    return { success: false, error: 'Question not found' };
  }

  async updateQuestionStatus(socketId, eventId, questionId, status, isAdminChecker, eventGetter) {
    const event = await eventGetter(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const isAdmin = await isAdminChecker(socketId);
    if (event.creatorId !== socketId && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    const questionsData = await this.redis.zRange(this.eventQuestionsKey(eventId), 0, -1);
    
    for (let i = 0; i < questionsData.length; i++) {
      const question = JSON.parse(questionsData[i]);
      if (question.id === questionId) {
        question.status = status;
        question.answeredAt = status === 'answered' ? Date.now() : null;

        await this.redis.zRem(this.eventQuestionsKey(eventId), questionsData[i]);
        await this.redis.zAdd(this.eventQuestionsKey(eventId), {
          score: question.createdAt,
          value: JSON.stringify(question)
        });

        return { success: true, question };
      }
    }

    return { success: false, error: 'Question not found' };
  }

  // ============================================
  // CHAT IN EVENT
  // ============================================

  async sendEventMessage(socketId, eventId, message, userGetter) {
    const user = await userGetter(socketId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const msgData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      eventId,
      senderId: socketId,
      senderName: user.name,
      senderPhoto: user.photo,
      text: message.slice(0, 500),
      timestamp: Date.now()
    };

    // Update stats
    const stats = await this.getEventStats(eventId);
    await this.updateEventStats(eventId, { totalMessages: (stats.totalMessages || 0) + 1 });

    return { success: true, message: msgData };
  }

  // ============================================
  // STATS & ANALYTICS
  // ============================================

  async getEventStats(eventId) {
    const data = await this.redis.get(this.eventStatsKey(eventId));
    return data ? JSON.parse(data) : {
      rsvpCount: 0,
      peakAttendees: 0,
      totalMessages: 0,
      totalQuestions: 0
    };
  }

  async updateEventStats(eventId, updates) {
    const stats = await this.getEventStats(eventId);
    const newStats = { ...stats, ...updates };
    await this.redis.set(this.eventStatsKey(eventId), JSON.stringify(newStats));
    return newStats;
  }

  async getAllEventsStats() {
    const events = await this.getAllEvents(true);
    
    let totalEvents = events.length;
    let totalRsvps = 0;
    let totalAttendees = 0;
    let totalMessages = 0;
    let totalQuestions = 0;

    for (const event of events) {
      totalRsvps += event.rsvpCount || 0;
      totalAttendees += event.stats?.peakAttendees || 0;
      totalMessages += event.stats?.totalMessages || 0;
      totalQuestions += event.stats?.totalQuestions || 0;
    }

    return {
      totalEvents,
      totalRsvps,
      totalAttendees,
      totalMessages,
      totalQuestions,
      averageAttendees: totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0
    };
  }

  // ============================================
  // CLEANUP
  // ============================================

  async removeUserFromAllEvents(socketId) {
    const events = await this.getAllEvents(false);
    
    for (const event of events) {
      await this.redis.sRem(this.eventAttendeesKey(event.id), socketId);
    }
  }
}

module.exports = { EventManager };
