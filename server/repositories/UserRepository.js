const crypto = require('crypto');
const JsonFileRepository = require('./base/JsonFileRepository');

/**
 * User Repository
 * Handles all user data access operations
 */
class UserRepository extends JsonFileRepository {
  constructor() {
    super('users.json');
  }

  /**
   * Hash password with salt
   * @param {string} password - Plain password
   * @param {string} salt - Optional salt (for verification)
   * @returns {Object} { hash, salt }
   * @private
   */
  _hashPassword(password, salt = null) {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, s, 64).toString('hex');
    return { hash, salt: s };
  }

  /**
   * Create a new user
   * @param {Object} userData - User data { email, password }
   * @returns {Object} Created user (without password hash/salt in response)
   */
  async create(userData) {
    const { email, password } = userData;
    
    // Check if user already exists
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('Email sudah terdaftar');
    }

    const { hash, salt } = this._hashPassword(password);
    const id = this._generateId('usr');
    
    const user = {
      id,
      email: String(email).toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
      verified: false,
      createdAt: this._getTimestamp(),
      updatedAt: this._getTimestamp()
    };

    const data = this._readAll();
    data[user.email] = user;
    this._writeAll(data);

    // Return user without sensitive data (for response)
    return {
      id: user.id,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  async findByEmail(email) {
    const data = this._readAll();
    const key = String(email).toLowerCase();
    return data[key] || null;
  }

  /**
   * Verify password against user
   * @param {Object} user - User object (must have passwordHash and passwordSalt)
   * @param {string} password - Plain password to verify
   * @returns {boolean} True if password matches
   */
  verifyPassword(user, password) {
    if (!user || !user.passwordSalt) {
      return false;
    }
    const { hash } = this._hashPassword(password, user.passwordSalt);
    return hash === user.passwordHash;
  }

  /**
   * Set user verification status
   * @param {string} email - User email
   * @param {boolean} verified - Verification status
   * @returns {Object|null} Updated user or null
   */
  async setVerified(email, verified = true) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    return await this.update(user.id, { verified: !!verified });
  }

  /**
   * Update user password
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Object|null} Updated user or null
   */
  async updatePassword(email, newPassword) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const { hash, salt } = this._hashPassword(newPassword);
    return await this.update(user.id, {
      passwordHash: hash,
      passwordSalt: salt
    });
  }

  /**
   * Override update to work with email key
   * @param {string} identifier - Can be ID or email
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated user
   */
  async update(identifier, updates) {
    let user;
    
    // Try to find by email first (since we use email as key)
    if (identifier.includes('@')) {
      user = await this.findByEmail(identifier);
    } else {
      // Find by ID
      const data = this._readAll();
      user = Object.values(data).find(u => u.id === identifier);
    }

    if (!user) {
      return null;
    }

    const data = this._readAll();
    const key = user.email;
    
    data[key] = {
      ...data[key],
      ...updates,
      updatedAt: this._getTimestamp()
    };

    this._writeAll(data);
    return data[key];
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User or null
   */
  async findById(id) {
    const data = this._readAll();
    return Object.values(data).find(user => user.id === id) || null;
  }
}

module.exports = new UserRepository();
