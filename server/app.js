const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, mongoose } = require('./db/connection');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global DB Connection Middleware for Serverless
// Ensures DB is connected before processing any request
app.use(async (req, res, next) => {
  // Skip for static assets to save time
  if (req.path.startsWith('/assets') || req.path.match(/\.(css|js|png|jpg|svg|ico)$/)) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Connection Failed in Middleware:', err);
    // Continue anyway, controllers might handle or fail gracefully
    next();
  }
});

// Debug endpoint to verify deployment & DB
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.3',
    description: 'React Auth Switch + Static Homepage',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    envCheck: {
      hasMongoURI: !!process.env.MONGODB_URI,
      mongoURILength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
    }
  });
});

// Explicitly serve homepage from legacy site (Read file directly to ensure it works)
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, '..', 'legacy_static_site', 'index.html');
    const html = require('fs').readFileSync(indexPath, 'utf8');
    res.send(html);
  } catch (err) {
    console.error('Error serving homepage:', err);
    res.status(500).send('Error loading homepage: ' + err.message);
  }
});

// API Routes
app.use('/api', routes);

// Static files: serve existing static from project root
app.use(express.static(path.join(__dirname, '..', 'legacy_static_site')));

// SPA build: serve React auth pages on website routes
const distDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use('/assets', express.static(path.join(distDir, 'assets')));

// SPA fallback for client-side routing on website paths
app.get(/^\/(login|register|forgot|verify-otp)(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

module.exports = app;
