/**
 * OTP Model
 * Wrapper around OtpRepository for backward compatibility
 * Uses Repository Pattern internally
 */
const OtpRepository = require('../repositories/OtpRepository');

class OtpModel {
  /**
   * Create a new OTP record
   * @param {string} email - User email
   * @param {string} code - OTP code
   * @param {string} purpose - OTP purpose
   * @param {number} ttlMinutes - Time to live in minutes
   * @returns {Object} Created OTP record
   */
  async create(email, code, purpose, ttlMinutes = 10) {
    return await OtpRepository.create(email, code, purpose, ttlMinutes);
  }

  /**
   * Validate OTP code
   * @param {string} email - User email
   * @param {string} code - OTP code to validate
   * @param {string} purpose - Expected purpose
   * @returns {Object} { ok: boolean, error?: string, otp?: Object }
   */
  async validate(email, code, purpose) {
    return await OtpRepository.validate(email, code, purpose);
  }

  /**
   * Consume (delete) OTP record
   * @param {string} email - User email
   * @returns {boolean} True if consumed
   */
  async consume(email) {
    return await OtpRepository.consume(email);
  }
}

// Export singleton instance
module.exports = new OtpModel();

