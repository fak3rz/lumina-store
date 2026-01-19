const JsonFileRepository = require('./base/JsonFileRepository');

/**
 * Order Repository
 * Handles all order data access operations
 */
class OrderRepository extends JsonFileRepository {
  constructor() {
    super('orders.json');
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  async create(orderData) {
    const id = this._generateId('ord');
    
    const order = {
      id,
      status: 'created',
      fulfillment: { status: 'pending' },
      createdAt: this._getTimestamp(),
      updatedAt: this._getTimestamp(),
      ...orderData
    };

    const data = this._readAll();
    data[id] = order;
    this._writeAll(data);

    return order;
  }

  /**
   * Find order by ID
   * Always reloads from file to ensure freshness
   * @param {string} id - Order ID
   * @returns {Object|null} Order or null
   */
  async findById(id) {
    // Reload to ensure freshness in multi-process scenarios
    return super.findById(id);
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Object|null} Updated order
   */
  async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  /**
   * Find orders by user ID
   * @param {string} userId - User ID
   * @returns {Array} Array of orders
   */
  async findByUserId(userId) {
    return await this.findAll({ userId });
  }

  /**
   * Find orders by status
   * @param {string} status - Order status
   * @returns {Array} Array of orders
   */
  async findByStatus(status) {
    return await this.findAll({ status });
  }

  /**
   * Override update to always reload before updating
   * @param {string} id - Order ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated order
   */
  async update(id, updates) {
    const data = this._readAll();
    if (!data[id]) {
      return null;
    }

    data[id] = {
      ...data[id],
      ...updates,
      updatedAt: this._getTimestamp()
    };

    this._writeAll(data);
    return data[id];
  }
}

module.exports = new OrderRepository();
