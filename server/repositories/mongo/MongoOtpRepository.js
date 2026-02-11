const BaseRepository = require('../base/BaseRepository');
const OtpModel = require('../../db/schemas/Otp');

/**
 * MongoDB OTP Repository
 * Replaces JsonFileRepository-based OtpRepository
 */
class MongoOtpRepository extends BaseRepository {
    /**
     * Create a new OTP record (upsert — replaces existing OTP for same email)
     * @param {string} email
     * @param {string} code
     * @param {string} purpose
     * @param {number} ttlMinutes
     * @returns {Object}
     */
    async create(email, code, purpose, ttlMinutes = 10) {
        const key = String(email).toLowerCase();
        const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

        const otpRecord = await OtpModel.findOneAndUpdate(
            { email: key },
            {
                $set: {
                    email: key,
                    code: String(code),
                    purpose,
                    expiresAt
                }
            },
            { upsert: true, new: true, lean: true }
        );

        return otpRecord;
    }

    /**
     * Find OTP by email
     * @param {string} email
     * @returns {Object|null}
     */
    async findByEmail(email) {
        const key = String(email).toLowerCase();
        const otp = await OtpModel.findOne({ email: key }).lean();
        return otp || null;
    }

    /**
     * Validate OTP code
     * @param {string} email
     * @param {string} code
     * @param {string} purpose
     * @returns {Object}
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
     * Consume (delete) OTP record
     * @param {string} email
     * @returns {boolean}
     */
    async consume(email) {
        const key = String(email).toLowerCase();
        const result = await OtpModel.deleteOne({ email: key });
        return result.deletedCount > 0;
    }

    /**
     * Clean expired OTPs
     * @returns {number}
     */
    async cleanExpired() {
        const result = await OtpModel.deleteMany({
            expiresAt: { $lt: Date.now() }
        });
        return result.deletedCount;
    }

    // Override base methods to use email as key
    async findById(id) {
        return await this.findByEmail(id);
    }

    async update(id, updates) {
        const key = String(id).toLowerCase();
        const updated = await OtpModel.findOneAndUpdate(
            { email: key },
            { $set: updates },
            { new: true, lean: true }
        );
        return updated || null;
    }

    async delete(id) {
        return await this.consume(id);
    }
}

module.exports = new MongoOtpRepository();
