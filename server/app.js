const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/connection');
const routes = require('./routes');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug endpoint to verify deployment
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.1',
    description: 'React Auth Switch',
    timestamp: new Date().toISOString()
  });
});

// Static files: serve existing static from project root
app.use(express.static(path.join(__dirname, '..', 'legacy_static_site')));

// SPA build: serve React auth pages on website routes
const distDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use('/assets', express.static(path.join(distDir, 'assets')));

// API Routes
app.use('/api', routes);

// SPA fallback for client-side routing on website paths
app.get(/^\/(login|register|forgot)(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

module.exports = app;
