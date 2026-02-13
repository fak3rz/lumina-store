/**
 * Order Model
 * Wrapper around OrderRepository for backward compatibility
 * Uses Repository Pattern internally
 */
const OrderRepository = require('../repositories/OrderRepository');

class OrderModel {
  /**
   * Create a new order
   * @param {Object} data - Order data
   * @returns {Object} Created order
   */
  async create(data) {
    return await OrderRepository.create(data);
  }

  /**
   * Find order by ID
   * @param {string} id - Order ID
   * @returns {Object|null} Order or null
   */
  async findById(id) {
    return await OrderRepository.findById(id);
  }

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated order
   */
  async update(id, updates) {
    return await OrderRepository.update(id, updates);
  }

  /**
   * Find all orders
   * @returns {Array} List of orders
   */
  async findAll() {
    return await OrderRepository.findAll();
  }
}

// Export singleton instance
module.exports = new OrderModel();
