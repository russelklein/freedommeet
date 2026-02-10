/**
 * Profile Discovery & Matching System
 */

class ProfileManager {
  constructor(redisClient, io) {
    this.redis = redisClient;
    this.io = io;
  }

  profileKey(id) { return `profile:${id}`; }
  likesGivenKey(id) { return `likes:given:${id}`; }
  likesReceivedKey(id) { return `likes:received:${id}`; }
  matchesKey(id) { return `matches:${id}`; }
  scheduledChatKey(id) { return `scheduled:${id}`; }
  allProfilesKey() { return 'profiles:all'; }
  viewsKey(id) { return `views:${id}`; }
  reportsKey(id) { return `reports:${id}`; }
  allReportsKey() { return 'reports:all'; }
  invitesKey(id) { return `invites:${id}`; }

  async saveProfile(userId, data) {
    const existing = await this.getProfile(userId);
    const profile = {
      id: userId,
      name: data.name,
      photo: data.photo,
      photos: data.photos || [],
      city: data.city || '',
      bio: data.bio || '',
      age: data.age || null,
      gender: data.gender || null,
      createdAt: existing?.createdAt || Date.now(),
      lastActive: Date.now()
    };
    await this.redis.set(this.profileKey(userId), JSON.stringify(profile), { EX: 2592000 });
    if (profile.photos.length > 0 || profile.photo) {
      await this.redis.sAdd(this.allProfilesKey(), userId);
    }
    return profile;
  }

  async getProfile(userId) {
    const data = await this.redis.get(this.profileKey(userId));
    return data ? JSON.parse(data) : null;
  }

  async deleteProfile(userId) {
    await this.redis.del(this.profileKey(userId));
    await this.redis.sRem(this.allProfilesKey(), userId);
    await this.redis.del(this.likesGivenKey(userId));
    await this.redis.del(this.likesReceivedKey(userId));
    await this.redis.del(this.matchesKey(userId));
    await this.redis.del(this.viewsKey(userId));
    return { success: true };
  }

  async updateLastActive(userId) {
    const profile = await this.getProfile(userId);
    if (profile) {
      profile.lastActive = Date.now();
      await this.redis.set(this.profileKey(userId), JSON.stringify(profile), { EX: 2592000 });
    }
  }

  async recordProfileView(viewerId, viewedId) {
    if (viewerId === viewedId) return;
    const viewData = JSON.stringify({ userId: viewerId, timestamp: Date.now() });
    await this.redis.hSet(this.viewsKey(viewedId), viewerId, viewData);
  }

  async getProfileViews(userId) {
    const data = await this.redis.hGetAll(this.viewsKey(userId));
    const views = [];
    for (const [viewerId, val] of Object.entries(data)) {
      const parsed = JSON.parse(val);
      const profile = await this.getProfile(viewerId);
      if (profile) {
        views.push({ userId: viewerId, profile, viewedAt: parsed.timestamp, isOnline: (Date.now() - profile.lastActive) < 300000 });
      }
    }
    return views.sort((a, b) => b.viewedAt - a.viewedAt);
  }

  async reportUser(reporterId, reportedId, reason) {
    const reportId = `report_${Date.now()}`;
    const report = { id: reportId, reporterId, reportedId, reason, timestamp: Date.now(), status: 'pending' };
    await this.redis.hSet(this.reportsKey(reportedId), reportId, JSON.stringify(report));
    await this.redis.hSet(this.allReportsKey(), reportId, JSON.stringify(report));
    const userReports = await this.redis.hGetAll(this.reportsKey(reportedId));
    const uniqueReporters = new Set(Object.values(userReports).map(r => JSON.parse(r).reporterId));
    return { success: true, reportCount: uniqueReporters.size, flagged: uniqueReporters.size >= 10 };
  }

  async getAllReports() {
    const data = await this.redis.hGetAll(this.allReportsKey());
    const reports = [];
    for (const [id, val] of Object.entries(data)) {
      const report = JSON.parse(val);
      const reporter = await this.getProfile(report.reporterId);
      const reported = await this.getProfile(report.reportedId);
      reports.push({ ...report, reporterName: reporter?.name || 'Deleted', reportedName: reported?.name || 'Deleted', reportedProfile: reported });
    }
    return reports.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getFlaggedUsers() {
    const allIds = await this.redis.sMembers(this.allProfilesKey());
    const flagged = [];
    for (const userId of allIds) {
      const reports = await this.redis.hGetAll(this.reportsKey(userId));
      const uniqueReporters = new Set(Object.values(reports).map(r => JSON.parse(r).reporterId));
      if (uniqueReporters.size >= 10) {
        const profile = await this.getProfile(userId);
        if (profile) flagged.push({ userId, profile, reportCount: uniqueReporters.size });
      }
    }
    return flagged;
  }

  async getAllUsers() {
    const allIds = await this.redis.sMembers(this.allProfilesKey());
    const users = [];
    for (const id of allIds) {
      const profile = await this.getProfile(id);
      if (profile) {
        const reports = await this.redis.hGetAll(this.reportsKey(id));
        const uniqueReporters = new Set(Object.values(reports).map(r => JSON.parse(r).reporterId));
        users.push({ ...profile, reportCount: uniqueReporters.size });
      }
    }
    return users.sort((a, b) => b.lastActive - a.lastActive);
  }

  async getInviteCount(userId) {
    return await this.redis.sCard(this.invitesKey(userId)) || 0;
  }

  async trackInvite(inviterId, odditionalMaterials) {
    await this.redis.sAdd(this.invitesKey(inviterId), odditionalMaterials);
    return await this.redis.sCard(this.invitesKey(inviterId));
  }

  async browseProfiles(userId, filters = {}) {
    const { city, gender, limit = 50, offset = 0 } = filters;
    const allIds = await this.redis.sMembers(this.allProfilesKey());
    const liked = await this.redis.sMembers(this.likesGivenKey(userId));
    const likedSet = new Set(liked);
    
    const activeProfiles = [];
    const inactiveProfiles = [];
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    
    for (const pid of allIds) {
      if (pid === userId) continue;
      if (likedSet.has(pid)) continue;
      const profile = await this.getProfile(pid);
      if (!profile) continue;
      
      // City filter
      if (city && profile.city && !profile.city.toLowerCase().includes(city.toLowerCase())) continue;
      
      // Gender filter
      if (gender && profile.gender !== gender) continue;
      
      const photoCount = profile.photos?.length || 0;
      if (photoCount < 3) continue;
      if (!profile.city?.trim() || !profile.bio?.trim()) continue;
      
      const isOnline = (Date.now() - profile.lastActive) < 300000; // 5 min
      const isInactive = (Date.now() - profile.lastActive) > TWO_WEEKS;
      
      const profileData = { ...profile, isOnline, isInactive };
      
      if (isInactive) {
        inactiveProfiles.push(profileData);
      } else {
        activeProfiles.push(profileData);
      }
    }
    
    // Sort active by most recent first
    activeProfiles.sort((a, b) => b.lastActive - a.lastActive);
    // Sort inactive by most recent first too
    inactiveProfiles.sort((a, b) => b.lastActive - a.lastActive);
    
    return {
      active: activeProfiles.slice(offset, offset + limit),
      inactive: inactiveProfiles,
      totalActive: activeProfiles.length,
      totalInactive: inactiveProfiles.length
    };
  }

  async getFeaturedProfiles(excludeUserId, gender = null, limit = 10) {
    const allIds = await this.redis.sMembers(this.allProfilesKey());
    const qualified = [];
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    for (const pid of allIds) {
      if (pid === excludeUserId) continue;
      const profile = await this.getProfile(pid);
      if (!profile) continue;
      if ((profile.photos?.length || 0) < 3) continue;
      if (!profile.city?.trim() || !profile.bio?.trim()) continue;
      
      // Only show recently active (within 1 week)
      if ((Date.now() - profile.lastActive) > ONE_WEEK) continue;
      
      // Gender filter
      if (gender && profile.gender !== gender) continue;
      
      const isOnline = (Date.now() - profile.lastActive) < 300000;
      qualified.push({ ...profile, isOnline });
    }
    
    // Sort by most recent first, then randomize top ones
    qualified.sort((a, b) => b.lastActive - a.lastActive);
    
    return qualified.slice(0, limit);
  }

  async likeProfile(fromId, toId) {
    const liker = await this.getProfile(fromId);
    const photoCount = liker?.photos?.length || 0;
    if (!liker || photoCount < 3 || !liker.city?.trim() || !liker.bio?.trim()) {
      return { success: false, error: 'Complete your profile (3+ photos, city, bio) to like others' };
    }
    await this.redis.sAdd(this.likesGivenKey(fromId), toId);
    await this.redis.hSet(this.likesReceivedKey(toId), fromId, JSON.stringify({ from: fromId, timestamp: Date.now() }));
    const mutual = await this.redis.sIsMember(this.likesGivenKey(toId), fromId);
    if (mutual) {
      await this.createMatch(fromId, toId);
      return { success: true, isMatch: true };
    }
    return { success: true, isMatch: false };
  }

  async getLikesReceived(userId) {
    const data = await this.redis.hGetAll(this.likesReceivedKey(userId));
    const likes = [];
    for (const [fromId, val] of Object.entries(data)) {
      const parsed = JSON.parse(val);
      const profile = await this.getProfile(fromId);
      if (profile) {
        likes.push({ userId: fromId, profile, likedAt: parsed.timestamp, isOnline: (Date.now() - profile.lastActive) < 300000 });
      }
    }
    return likes.sort((a, b) => b.likedAt - a.likedAt);
  }

  async removeLike(userId, fromId) {
    await this.redis.hDel(this.likesReceivedKey(userId), fromId);
    return { success: true };
  }

  async createMatch(id1, id2) {
    const matchData = JSON.stringify({ users: [id1, id2], createdAt: Date.now(), scheduledChat: null });
    await this.redis.hSet(this.matchesKey(id1), id2, matchData);
    await this.redis.hSet(this.matchesKey(id2), id1, matchData);
    await this.redis.hDel(this.likesReceivedKey(id1), id2);
    await this.redis.hDel(this.likesReceivedKey(id2), id1);
    return { users: [id1, id2] };
  }

  async getMatches(userId) {
    const data = await this.redis.hGetAll(this.matchesKey(userId));
    const matches = [];
    for (const [otherId, val] of Object.entries(data)) {
      const info = JSON.parse(val);
      const profile = await this.getProfile(otherId);
      if (profile) {
        matches.push({ userId: otherId, profile, matchedAt: info.createdAt, scheduledChat: info.scheduledChat, isOnline: (Date.now() - profile.lastActive) < 300000 });
      }
    }
    return matches.sort((a, b) => b.matchedAt - a.matchedAt);
  }

  async unmatch(userId, otherId) {
    await this.redis.hDel(this.matchesKey(userId), otherId);
    await this.redis.hDel(this.matchesKey(otherId), userId);
    return { success: true };
  }

  async scheduleChat(userId, matchId, time, duration = 5) {
    const matchData = await this.redis.hGet(this.matchesKey(userId), matchId);
    if (!matchData) return { success: false, error: 'Not matched' };
    const chatId = `chat_${Date.now()}`;
    const chat = { id: chatId, users: [userId, matchId], scheduledTime: time, duration, status: 'scheduled' };
    await this.redis.set(this.scheduledChatKey(chatId), JSON.stringify(chat), { EX: 86400 });
    const match = JSON.parse(matchData);
    match.scheduledChat = chat;
    await this.redis.hSet(this.matchesKey(userId), matchId, JSON.stringify(match));
    await this.redis.hSet(this.matchesKey(matchId), userId, JSON.stringify(match));
    return { success: true, chat };
  }

  async cancelChat(userId, otherId, chatId) {
    const matchData = await this.redis.hGet(this.matchesKey(userId), otherId);
    if (matchData) {
      const match = JSON.parse(matchData);
      match.scheduledChat = null;
      await this.redis.hSet(this.matchesKey(userId), otherId, JSON.stringify(match));
      await this.redis.hSet(this.matchesKey(otherId), userId, JSON.stringify(match));
    }
    await this.redis.del(this.scheduledChatKey(chatId));
    return { success: true };
  }
}

module.exports = { ProfileManager };
