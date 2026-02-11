const crypto = require('crypto');
const BaseRepository = require('../base/BaseRepository');
const UserModel = require('../../db/schemas/User');

/**
 * MongoDB User Repository
 * Replaces JsonFileRepository-based UserRepository
 */
class MongoUserRepository extends BaseRepository {
    /**
     * Hash password with salt
     * @param {string} password
     * @param {string} salt
     * @returns {Object} { hash, salt }
     * @private
     */
    _hashPassword(password, salt = null) {
        const s = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, s, 64).toString('hex');
        return { hash, salt: s };
    }

    /**
     * Generate a unique ID
     * @param {string} prefix
     * @returns {string}
     * @private
     */
    _generateId(prefix = 'id') {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    }

    /**
     * Create a new user
     * @param {Object} userData - { email, password }
     * @returns {Object} Created user (without password hash/salt)
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

        const user = await UserModel.create({
            id,
            email: String(email).toLowerCase(),
            passwordHash: hash,
            passwordSalt: salt,
            verified: false
        });

        // Return without sensitive data
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
     * @param {string} email
     * @returns {Object|null}
     */
    async findByEmail(email) {
        const key = String(email).toLowerCase();
        const user = await UserModel.findOne({ email: key }).lean();
        return user || null;
    }

    /**
     * Verify password against user
     * @param {Object} user
     * @param {string} password
     * @returns {boolean}
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
     * @param {string} email
     * @param {boolean} verified
     * @returns {Object|null}
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
     * @param {string} email
     * @param {string} newPassword
     * @returns {Object|null}
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
     * Update user by identifier (email or id)
     * @param {string} identifier
     * @param {Object} updates
     * @returns {Object|null}
     */
    async update(identifier, updates) {
        let query;
        if (identifier.includes('@')) {
            query = { email: String(identifier).toLowerCase() };
        } else {
            query = { id: identifier };
        }

        const updated = await UserModel.findOneAndUpdate(
            query,
            { $set: updates },
            { new: true, lean: true }
        );

        return updated || null;
    }

    /**
     * Find user by ID
     * @param {string} id
     * @returns {Object|null}
     */
    async findById(id) {
        const user = await UserModel.findOne({ id }).lean();
        return user || null;
    }

    /**
     * Find all users
     * @param {Object} filter
     * @returns {Array}
     */
    async findAll(filter = {}) {
        return await UserModel.find(filter).lean();
    }

    /**
     * Delete a user
     * @param {string} id
     * @returns {boolean}
     */
    async delete(id) {
        const result = await UserModel.deleteOne({ id });
        return result.deletedCount > 0;
    }
}

module.exports = new MongoUserRepository();
