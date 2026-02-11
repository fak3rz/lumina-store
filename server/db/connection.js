const mongoose = require('mongoose');
const config = require('../config');

// Global cache to prevent multiple connections in Serverless environment
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Atlas (Serverless Optimized)
 */
async function connectDB() {
    // If we have a connection and it's ready, return it.
    if (cached.conn) {
        return cached.conn;
    }

    const uri = config.mongodb.uri;
    if (!uri) {
        console.warn('[MongoDB] MONGODB_URI not set — skipping database connection');
        // Return null instead of void to signal no connection
        return null;
    }

    // If no promise yet, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: true, // Allow buffering, but we await connection usually
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log('[MongoDB] Connecting to MongoDB Atlas...');
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log('[MongoDB] ✅ Connected to MongoDB Atlas');
            return mongoose;
        }).catch((err) => {
            console.error('[MongoDB] ❌ Connection error:', err.message);
            throw err; // Re-throw to handle in caller
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Reset promise on failure so we can retry
        console.error('[MongoDB] Failed to await connection:', e.message);
        throw e;
    }

    return cached.conn;
}

// Event listeners intact for logging (optional in serverless but good for debugging)
mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
});

module.exports = { connectDB, mongoose };
