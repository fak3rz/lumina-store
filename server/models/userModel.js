/**
 * User Model
 * Wrapper around UserRepository for backward compatibility
 * Uses Repository Pattern internally
 */
const UserRepository = require('../repositories/UserRepository');

class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - { email, password }
   * @returns {Object} User object (full data from repository)
   */
  async createUser({ email, password }) {
    try {
      const created = await UserRepository.create({ email, password });
      // Return full user data including hash/salt (needed for internal operations)
      const fullUser = await UserRepository.findByEmail(email);
      return fullUser;
    } catch (error) {
      // Re-throw repository errors
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  async findByEmail(email) {
    return await UserRepository.findByEmail(email);
  }

  /**
   * Verify password against user
   * @param {Object} user - User object
   * @param {string} password - Plain password
   * @returns {boolean} True if password matches
   */
  verifyPassword(user, password) {
    return UserRepository.verifyPassword(user, password);
  }

  /**
   * Set user verification status
   * @param {string} email - User email
   * @param {boolean} verified - Verification status
   * @returns {Object|null} Updated user
   */
  async setVerified(email, verified = true) {
    return await UserRepository.setVerified(email, verified);
  }

  /**
   * Update user password
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Object|null} Updated user
   */
  async updatePassword(email, newPassword) {
    return await UserRepository.updatePassword(email, newPassword);
  }
}

// Export singleton instance
module.exports = new UserModel();

