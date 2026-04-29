/**
 * Auth middleware:
 *  - requireAuth: accepts JWT access token OR API key
 *  - requireRole: RBAC enforcement
 *  - socketAuth: Socket.IO handshake auth
 */
const { verifyAccess, verifyToken } = require('../config/auth');
const apiKeyService = require('../services/apiKeyService');
const { fail } = require('../utils/response');

function requireAuth(req, res, next) {
  // 1) Bearer token
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const decoded = verifyAccess(token) || verifyToken(token);
    if (decoded) {
      req.user = { id: decoded.sub || decoded.id, username: decoded.username, role: decoded.role };
      req.authMethod = 'jwt';
      return next();
    }
  }
  // 2) API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const user = apiKeyService.resolveUser(apiKey);
    if (user) {
      req.user = user;
      req.authMethod = 'apikey';
      return next();
    }
  }
  return fail(res, 401, 'Authentication required');
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Authentication required');
    if (!roles.includes(req.user.role)) return fail(res, 403, 'Insufficient permissions');
    next();
  };
}

function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  const apiKey = socket.handshake.auth?.apiKey || socket.handshake.headers?.['x-api-key'];
  if (token) {
    const decoded = verifyAccess(token) || verifyToken(token);
    if (decoded) { socket.user = { id: decoded.sub || decoded.id, username: decoded.username, role: decoded.role }; return next(); }
  }
  if (apiKey) {
    const user = apiKeyService.resolveUser(apiKey);
    if (user) { socket.user = user; return next(); }
  }
  // Allow anonymous in dev for backward compat (UI used to skip socket auth)
  if (process.env.NODE_ENV !== 'production') return next();
  return next(new Error('Authentication required'));
}

module.exports = { requireAuth, requireRole, socketAuth };
