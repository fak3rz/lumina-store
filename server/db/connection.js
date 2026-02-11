const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 * Handles connection events and retry logic
 */
async function connectDB() {
    if (isConnected) return;

    const uri = config.mongodb.uri;
    if (!uri) {
        console.warn('[MongoDB] MONGODB_URI not set — skipping database connection');
        return;
    }

    try {
        await mongoose.connect(uri, {
            // Mongoose 7+ uses these defaults, but being explicit
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('[MongoDB] ✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('[MongoDB] ❌ Connection failed:', error.message);
        // Don't crash the app — allow fallback to JSON storage if needed
    }
}

// Connection event listeners
mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[MongoDB] Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
});

module.exports = { connectDB, mongoose };
