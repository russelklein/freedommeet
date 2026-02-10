/**
 * Authentication System
 * - Facebook Login (primary)
 * - SMS/Phone verification (secondary)
 * No email - too easy to fake
 */

class AuthManager {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  // Keys
  phoneKey(phone) { return `auth:phone:${phone}`; }
  verifyCodeKey(phone) { return `auth:verify:${phone}`; }
  facebookKey(fbId) { return `auth:facebook:${fbId}`; }
  userAuthKey(userId) { return `auth:user:${userId}`; }
  signupSourceKey() { return 'stats:signup_sources'; }

  // ============ PHONE VERIFICATION ============

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(phone) {
    const normalizedPhone = phone.replace(/\D/g, '');
    const code = this.generateCode();
    
    // Store code with 5 minute expiry
    await this.redis.set(this.verifyCodeKey(normalizedPhone), code, { EX: 300 });
    
    // In production: Send via Twilio
    // For testing: Return code (remove in production!)
    console.log(`[DEV] Verification code for ${normalizedPhone}: ${code}`);
    
    return { success: true, message: 'Code sent', devCode: code };
  }

  async verifyCode(phone, code) {
    const normalizedPhone = phone.replace(/\D/g, '');
    const storedCode = await this.redis.get(this.verifyCodeKey(normalizedPhone));
    
    if (!storedCode) {
      return { success: false, error: 'Code expired. Request a new one.' };
    }
    
    if (storedCode !== code) {
      return { success: false, error: 'Invalid code' };
    }
    
    await this.redis.del(this.verifyCodeKey(normalizedPhone));
    
    const existingUser = await this.redis.get(this.phoneKey(normalizedPhone));
    
    return { 
      success: true, 
      isNewUser: !existingUser,
      existingUserId: existingUser || null
    };
  }

  async linkPhone(userId, phone) {
    const normalizedPhone = phone.replace(/\D/g, '');
    await this.redis.set(this.phoneKey(normalizedPhone), userId);
    await this.redis.hSet(this.userAuthKey(userId), 'phone', normalizedPhone);
  }

  // ============ FACEBOOK LOGIN ============

  async linkFacebook(userId, facebookId, facebookData = {}) {
    await this.redis.set(this.facebookKey(facebookId), userId);
    await this.redis.hSet(this.userAuthKey(userId), 'facebookId', facebookId);
    await this.redis.hSet(this.userAuthKey(userId), 'facebookData', JSON.stringify(facebookData));
  }

  async getUserByFacebook(facebookId) {
    return await this.redis.get(this.facebookKey(facebookId));
  }

  // ============ SIGNUP SOURCE TRACKING ============

  async trackSignupSource(source) {
    await this.redis.hIncrBy(this.signupSourceKey(), source, 1);
    await this.redis.hIncrBy(this.signupSourceKey(), `${source}:${this.getToday()}`, 1);
  }

  async getSignupSources() {
    const data = await this.redis.hGetAll(this.signupSourceKey());
    return {
      facebook: parseInt(data.facebook) || 0,
      phone: parseInt(data.phone) || 0,
      invite: parseInt(data.invite) || 0,
      total: (parseInt(data.facebook) || 0) + (parseInt(data.phone) || 0) + (parseInt(data.invite) || 0)
    };
  }

  getToday() {
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = { AuthManager };
