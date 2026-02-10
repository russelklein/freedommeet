/**
 * Stats Tracker - Permanent metrics that survive profile cleanup
 * These stats are valuable for showing growth and selling the platform
 */

class StatsManager {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  // Keys - these never expire
  statsKey() { return 'stats:global'; }
  dailyStatsKey(date) { return `stats:daily:${date}`; }
  monthlyStatsKey(month) { return `stats:monthly:${month}`; }
  emailListKey() { return 'emails:list'; }

  // Get today's date string
  getToday() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  getMonth() {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  // ============ GLOBAL LIFETIME STATS ============

  async incrementStat(field, amount = 1) {
    await this.redis.hIncrBy(this.statsKey(), field, amount);
    await this.redis.hIncrBy(this.dailyStatsKey(this.getToday()), field, amount);
    await this.redis.hIncrBy(this.monthlyStatsKey(this.getMonth()), field, amount);
  }

  async getGlobalStats() {
    const stats = await this.redis.hGetAll(this.statsKey());
    return {
      totalSignups: parseInt(stats.totalSignups) || 0,
      totalMatches: parseInt(stats.totalMatches) || 0,
      totalMessages: parseInt(stats.totalMessages) || 0,
      totalLikes: parseInt(stats.totalLikes) || 0,
      totalRouletteSessions: parseInt(stats.totalRouletteSessions) || 0,
      totalRoomMessages: parseInt(stats.totalRoomMessages) || 0,
      totalReports: parseInt(stats.totalReports) || 0,
      totalInvitesSent: parseInt(stats.totalInvitesSent) || 0,
      totalProfileViews: parseInt(stats.totalProfileViews) || 0,
      peakConcurrentUsers: parseInt(stats.peakConcurrentUsers) || 0
    };
  }

  async getDailyStats(date) {
    const stats = await this.redis.hGetAll(this.dailyStatsKey(date || this.getToday()));
    return stats;
  }

  async getMonthlyStats(month) {
    const stats = await this.redis.hGetAll(this.monthlyStatsKey(month || this.getMonth()));
    return stats;
  }

  // Get stats for last N days
  async getStatsRange(days = 30) {
    const results = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = await this.getDailyStats(dateStr);
      results.push({ date: dateStr, ...stats });
    }
    
    return results.reverse();
  }

  // ============ SPECIFIC STAT TRACKERS ============

  async trackSignup(userData) {
    await this.incrementStat('totalSignups');
    
    // Save email to permanent list
    if (userData.email) {
      await this.addEmail(userData.email, userData.name, userData.city);
    }
    
    // Track gender distribution
    if (userData.gender === 'male') {
      await this.incrementStat('maleSignups');
    } else if (userData.gender === 'female') {
      await this.incrementStat('femaleSignups');
    }
  }

  async trackMatch() {
    await this.incrementStat('totalMatches');
  }

  async trackLike() {
    await this.incrementStat('totalLikes');
  }

  async trackMessage(type = 'chat') {
    await this.incrementStat('totalMessages');
    if (type === 'roulette') {
      await this.incrementStat('totalRouletteMessages');
    } else if (type === 'room') {
      await this.incrementStat('totalRoomMessages');
    } else if (type === 'private') {
      await this.incrementStat('totalPrivateMessages');
    }
  }

  async trackRouletteSession() {
    await this.incrementStat('totalRouletteSessions');
  }

  async trackProfileView() {
    await this.incrementStat('totalProfileViews');
  }

  async trackInvite() {
    await this.incrementStat('totalInvitesSent');
  }

  async trackReport() {
    await this.incrementStat('totalReports');
  }

  async updatePeakUsers(count) {
    const current = await this.redis.hGet(this.statsKey(), 'peakConcurrentUsers');
    if (!current || count > parseInt(current)) {
      await this.redis.hSet(this.statsKey(), 'peakConcurrentUsers', count.toString());
    }
  }

  // ============ EMAIL LIST (For Sale Value) ============

  async addEmail(email, name = '', city = '') {
    const data = JSON.stringify({
      email,
      name,
      city,
      addedAt: Date.now()
    });
    await this.redis.hSet(this.emailListKey(), email, data);
  }

  async getEmailList() {
    const data = await this.redis.hGetAll(this.emailListKey());
    const emails = [];
    for (const [email, val] of Object.entries(data)) {
      emails.push(JSON.parse(val));
    }
    return emails.sort((a, b) => b.addedAt - a.addedAt);
  }

  async getEmailCount() {
    return await this.redis.hLen(this.emailListKey());
  }

  async exportEmailsCSV() {
    const emails = await this.getEmailList();
    const header = 'email,name,city,joined_date\n';
    const rows = emails.map(e => 
      `${e.email},"${e.name}","${e.city}",${new Date(e.addedAt).toISOString()}`
    ).join('\n');
    return header + rows;
  }

  // ============ ACTIVE USER TRACKING ============

  async setActiveUsers(count) {
    await this.redis.set('stats:activeUsers', count.toString());
    await this.updatePeakUsers(count);
  }

  async getActiveUsers() {
    const count = await this.redis.get('stats:activeUsers');
    return parseInt(count) || 0;
  }
}

module.exports = { StatsManager };
