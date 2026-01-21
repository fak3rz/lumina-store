const fs = require('fs');
const path = require('path');
const BaseRepository = require('./BaseRepository');

/**
 * Base implementation for JSON file-based repositories
 * Handles common file operations (read, write, ensure files exist)
 */
class JsonFileRepository extends BaseRepository {
  constructor(fileName, dataDir = path.join(__dirname, '../../data')) {
    super();
    this.dataDir = dataDir;
    this.filePath = path.join(dataDir, fileName);
    this._cache = {};
    this._loadFromDisk();
  }

  /**
   * Load data from disk into cache
   * @private
   */
  _loadFromDisk() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this._cache = content ? JSON.parse(content) : {};
      } else {
        // Try to create file, but don't crash if we can't (read-only)
        try {
          this._ensureDataFile();
        } catch (e) {
          console.warn(`[Storage] Could not create file ${this.filePath} (likely read-only environment). Using in-memory storage.`);
        }
      }
    } catch (error) {
      console.error(`[Storage] Error reading file ${this.filePath}:`, error);
      this._cache = {};
    }
  }

  /**
   * Ensure data directory and file exist
   * @private
   */
  _ensureDataFile() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }
  }

  /**
   * Read all data from memory (primary) or file
   * @returns {Object} Data object
   * @protected
   */
  _readAll() {
    return this._cache;
  }

  /**
   * Write data to memory and try to persist to file
   * @param {Object} data - Data to write
   * @protected
   */
  _writeAll(data) {
    // 1. Update in-memory cache immediately
    this._cache = data;

    // 2. Try to persist to disk (best effort)
    try {
      this._ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      // If read-only file system, just log and continue (data lives in memory)
      if (error.code === 'EROFS' || error.syscall === 'open' || error.syscall === 'write') {
        console.warn(`[Storage] Write failed (Read-Only File System). Data is held in memory only.`);
      } else {
        console.error(`Error writing file ${this.filePath}:`, error);
        // Don't throw, so the app keeps working even if persistence fails
      }
    }
  }

  /**
   * Generate a unique ID
   * @param {string} prefix - ID prefix (e.g., 'usr', 'ord')
   * @returns {string} Generated ID
   * @protected
   */
  _generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   * @protected
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  // Default implementations (can be overridden by child classes)

  async findById(id) {
    const data = this._readAll();
    return data[id] || null;
  }

  async findAll(filter = {}) {
    const data = this._readAll();
    const entities = Object.values(data);

    // Simple filtering (can be extended)
    if (Object.keys(filter).length === 0) {
      return entities;
    }

    return entities.filter(entity => {
      return Object.keys(filter).every(key => {
        return entity[key] === filter[key];
      });
    });
  }

  async create(entityData) {
    const data = this._readAll();
    const id = entityData.id || this._generateId();

    const entity = {
      id,
      createdAt: this._getTimestamp(),
      updatedAt: this._getTimestamp(),
      ...entityData
    };

    data[id] = entity;
    this._writeAll(data);
    return entity;
  }

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

  async delete(id) {
    const data = this._readAll();
    if (!data[id]) {
      return false;
    }

    delete data[id];
    this._writeAll(data);
    return true;
  }
}

module.exports = JsonFileRepository;
