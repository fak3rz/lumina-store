/**
 * Base Repository Abstract Class
 * Provides interface for all repository implementations
 */
class BaseRepository {
  /**
   * Find an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findById(id) {
    throw new Error('findById method must be implemented');
  }

  /**
   * Find all entities
   * @param {Object} filter - Optional filter object
   * @returns {Promise<Array>} Array of entities
   */
  async findAll(filter = {}) {
    throw new Error('findAll method must be implemented');
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create(data) {
    throw new Error('create method must be implemented');
  }

  /**
   * Update an entity
   * @param {string} id - Entity ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated entity or null if not found
   */
  async update(id, updates) {
    throw new Error('update method must be implemented');
  }

  /**
   * Delete an entity
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    throw new Error('delete method must be implemented');
  }

  /**
   * Check if entity exists
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    const entity = await this.findById(id);
    return entity !== null;
  }
}

module.exports = BaseRepository;
