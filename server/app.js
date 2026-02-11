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

// Static files: serve existing static from project root
app.use(express.static(path.join(__dirname, '..', 'legacy_static_site')));

// SPA build: serve React auth pages on website routes
const distDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use('/assets', express.static(path.join(distDir, 'assets')));

// API Routes
app.use('/api', routes);

// Serve legacy HTML pages for auth routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'legacy_static_site', 'pages', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'legacy_static_site', 'pages', 'register.html'));
});
app.get('/forgot', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'legacy_static_site', 'pages', 'forgot.html'));
});

// SPA fallback (optional, can be removed if not using React router for other paths)
// app.get(/^\/(login|register|forgot)(\/.*)?$/, (req, res) => {
//   res.sendFile(path.join(distDir, 'index.html'));
// });

module.exports = app;
