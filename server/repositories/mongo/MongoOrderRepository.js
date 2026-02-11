const BaseRepository = require('../base/BaseRepository');
const OrderModel = require('../../db/schemas/Order');

/**
 * MongoDB Order Repository
 * Replaces JsonFileRepository-based OrderRepository
 */
class MongoOrderRepository extends BaseRepository {
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
     * Create a new order
     * @param {Object} orderData
     * @returns {Object}
     */
    async create(orderData) {
        const id = this._generateId('ord');

        const order = await OrderModel.create({
            id,
            status: 'created',
            fulfillment: { status: 'pending' },
            ...orderData
        });

        return order.toObject();
    }

    /**
     * Find order by ID
     * @param {string} id
     * @returns {Object|null}
     */
    async findById(id) {
        const order = await OrderModel.findOne({ id }).lean();
        return order || null;
    }

    /**
     * Update order status
     * @param {string} id
     * @param {string} status
     * @returns {Object|null}
     */
    async updateStatus(id, status) {
        return await this.update(id, { status });
    }

    /**
     * Find orders by user ID
     * @param {string} userId
     * @returns {Array}
     */
    async findByUserId(userId) {
        return await this.findAll({ userId });
    }

    /**
     * Find orders by status
     * @param {string} status
     * @returns {Array}
     */
    async findByStatus(status) {
        return await this.findAll({ status });
    }

    /**
     * Find all orders with optional filter
     * @param {Object} filter
     * @returns {Array}
     */
    async findAll(filter = {}) {
        return await OrderModel.find(filter).lean();
    }

    /**
     * Update order
     * @param {string} id
     * @param {Object} updates
     * @returns {Object|null}
     */
    async update(id, updates) {
        const updated = await OrderModel.findOneAndUpdate(
            { id },
            { $set: updates },
            { new: true, lean: true }
        );

        return updated || null;
    }

    /**
     * Delete an order
     * @param {string} id
     * @returns {boolean}
     */
    async delete(id) {
        const result = await OrderModel.deleteOne({ id });
        return result.deletedCount > 0;
    }
}

module.exports = new MongoOrderRepository();
