const app = require('./app');
const config = require('./config');

const port = Number(config.port) || 3000;

const server = app.listen(port, () => {
  console.log(`[Server] Listening on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('[Server] Failed to start:', err && err.message ? err.message : err);
});

