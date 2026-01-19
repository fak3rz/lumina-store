const JsonFileRepository = require('./base/JsonFileRepository');

/**
 * OTP Repository
 * Handles all OTP data access operations
 */
class OtpRepository extends JsonFileRepository {
  constructor() {
    super('otps.json');
  }

  /**
   * Create a new OTP record
   * @param {string} email - User email
   * @param {string} code - OTP code
   * @param {string} purpose - OTP purpose (e.g., 'verify', 'reset')
   * @param {number} ttlMinutes - Time to live in minutes (default: 10)
   * @returns {Object} Created OTP record
   */
  async create(email, code, purpose, ttlMinutes = 10) {
    const key = String(email).toLowerCase();
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

    const otpRecord = {
      email: key,
      code: String(code),
      purpose,
      expiresAt,
      createdAt: this._getTimestamp()
    };

    const data = this._readAll();
    data[key] = otpRecord;
    this._writeAll(data);

    return otpRecord;
  }

  /**
   * Find OTP by email
   * @param {string} email - User email
   * @returns {Object|null} OTP record or null
   */
  async findByEmail(email) {
    const key = String(email).toLowerCase();
    const data = this._readAll();
    return data[key] || null;
  }

  /**
   * Validate OTP code
   * @param {string} email - User email
   * @param {string} code - OTP code to validate
   * @param {string} purpose - Expected purpose
   * @returns {Object} { ok: boolean, error?: string, otp?: Object }
   */
  async validate(email, code, purpose) {
    const otpRecord = await this.findByEmail(email);

    if (!otpRecord) {
      return { ok: false, error: 'not_found' };
    }

    if (otpRecord.purpose !== purpose) {
      return { ok: false, error: 'wrong_purpose' };
    }

    if (Date.now() > otpRecord.expiresAt) {
      return { ok: false, error: 'expired' };
    }

    if (String(otpRecord.code) !== String(code)) {
      return { ok: false, error: 'invalid_code' };
    }

    return { ok: true, otp: otpRecord };
  }

  /**
   * Delete OTP record (consume/use)
   * @param {string} email - User email
   * @returns {boolean} True if deleted
   */
  async consume(email) {
    const key = String(email).toLowerCase();
    const data = this._readAll();

    if (!data[key]) {
      return false;
    }

    delete data[key];
    this._writeAll(data);
    return true;
  }

  /**
   * Clean expired OTPs
   * @returns {number} Number of expired OTPs removed
   */
  async cleanExpired() {
    const data = this._readAll();
    const now = Date.now();
    let removed = 0;

    Object.keys(data).forEach(key => {
      if (data[key].expiresAt && Date.now() > data[key].expiresAt) {
        delete data[key];
        removed++;
      }
    });

    if (removed > 0) {
      this._writeAll(data);
    }

    return removed;
  }

  // Override base methods to use email as key instead of ID
  async findById(id) {
    // For OTP, we use email as the key, not ID
    return await this.findByEmail(id);
  }

  async update(id, updates) {
    // OTPs are typically not updated, they are consumed
    // But if needed, we can update by email
    const key = String(id).toLowerCase();
    const data = this._readAll();
    
    if (!data[key]) {
      return null;
    }

    data[key] = {
      ...data[key],
      ...updates,
      updatedAt: this._getTimestamp()
    };

    this._writeAll(data);
    return data[key];
  }

  async delete(id) {
    // Use email as identifier for deletion
    return await this.consume(id);
  }
}

module.exports = new OtpRepository();
