/**
 * NELL VPS PANEL v2.0 — Backend Entry
 * Express + Socket.IO + Helmet + Rate limit + JWT (access/refresh) + RBAC
 *
 * All v1 endpoints remain functional. New v2 features are additive.
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const { Server } = require('socket.io');

const logger = require('./utils/logger');
const { ok } = require('./utils/response');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { socketAuth } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/authRoutes');
const botRoutes = require('./routes/botRoutes');
const fileRoutes = require('./routes/fileRoutes');
const systemRoutes = require('./routes/systemRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');

// Services
const botService = require('./services/botService');
const monitorService = require('./services/monitorService');
const dockerSandbox = require('./sandbox/dockerSandbox');

// ─── Bootstrap ────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// CORS allowlist (comma separated)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);

const io = new Server(server, {
  cors: { origin: corsOrigins, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000, pingInterval: 25000,
});
global.io = io;

// Ensure storage dirs
['bots', 'storage', 'storage/uploads', 'storage/logs', 'storage/templates'].forEach(d => {
  fs.ensureDirSync(path.join(__dirname, d));
});

// ─── Security & middleware ────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('tiny', { stream: { write: m => logger.info(m.trim()) } }));
app.use('/api', apiLimiter);

// ─── Health & info ────────────────────────────────────────────
app.get('/api/health', (_req, res) => ok(res, {
  status: 'ok',
  version: '2.0.0',
  uptime: process.uptime(),
  docker: dockerSandbox.available,
  timestamp: new Date().toISOString(),
}));

// ─── API routes ───────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/bots',    botRoutes);
app.use('/api/files',   fileRoutes);
app.use('/api/system',  systemRoutes);
app.use('/api/keys',    apiKeyRoutes);

// 404 for unknown API
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Error handler last
app.use(errorHandler);

// ─── Socket.IO ────────────────────────────────────────────────
io.use(socketAuth);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id} (${socket.user?.username || 'anon'})`);

  socket.on('join:bot', (botId) => {
    socket.join(`bot:${botId}`);
    const b = botService.getBot(botId);
    if (b?.logs) socket.emit('bot:logs:history', { botId, logs: b.logs });
    socket.emit('bot:status', { botId, status: b?.status || 'unknown' });
  });
  socket.on('leave:bot', (botId) => socket.leave(`bot:${botId}`));

  socket.on('join:system', () => socket.join('system'));
  socket.on('leave:system', () => socket.leave('system'));

  socket.on('join:bots', () => socket.join('bots'));

  socket.on('bot:command', async ({ botId, command }) => {
    try {
      const result = await botService.runCommand(botId, command);
      socket.emit('bot:command:result', { botId, result });
    } catch (e) {
      socket.emit('bot:command:error', { botId, error: e.message });
    }
  });

  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// ─── Boot ─────────────────────────────────────────────────────
(async () => {
  await dockerSandbox.ping();
  logger.info(`Execution mode: ${process.env.EXECUTION_MODE || 'docker'} | Docker available: ${dockerSandbox.available}`);
  botService.loadPersistedBots();
  monitorService.startMonitoring(2000);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    logger.success(`╔══════════════════════════════════════════╗`);
    logger.success(`║  🤖 Nell VPS Panel v2.0 — Backend ready  ║`);
    logger.success(`║  http://localhost:${PORT}                    ║`);
    logger.success(`╚══════════════════════════════════════════╝`);
  });
})();

module.exports = { app, server, io };
