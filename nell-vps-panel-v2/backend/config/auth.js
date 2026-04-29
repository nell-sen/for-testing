/**
 * Auth configuration & helpers.
 *  - JWT Access + Refresh tokens
 *  - bcrypt password hashing
 *  - Default admin user auto-seeded
 *  - Backward compatible with v1 endpoints (login still returns `token`)
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const storage = require('../utils/storage');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'nell-access-dev-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (ACCESS_SECRET + '-refresh');
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// ── User store ────────────────────────────────────────────────
function seedUsersIfEmpty() {
  const users = storage.read('users.json', null);
  if (!users || users.length === 0) {
    const seed = [{
      id: uuid(),
      username: 'admin',
      password: bcrypt.hashSync('123admin', 10),
      role: 'admin',
      createdAt: new Date().toISOString(),
    }];
    storage.write('users.json', seed);
    return seed;
  }
  return users;
}
function loadUsers() { return seedUsersIfEmpty(); }
function saveUsers(users) { storage.write('users.json', users); }

// ── Token helpers ─────────────────────────────────────────────
function signAccess(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}
function signRefresh(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}
function verifyAccess(token) {
  try { return jwt.verify(token, ACCESS_SECRET); } catch { return null; }
}
function verifyRefresh(token) {
  try { return jwt.verify(token, REFRESH_SECRET); } catch { return null; }
}

// Backward compat: v1 used a single token via JWT_SECRET
function generateToken(user) { return signAccess(user); }
function verifyToken(token) {
  // Try access first, then v1 legacy
  const a = verifyAccess(token);
  if (a) return a;
  try {
    const legacy = jwt.verify(token, process.env.JWT_SECRET || 'nell-vps-panel-secret-2024-!@#$%^');
    return { ...legacy, sub: legacy.id };
  } catch { return null; }
}

module.exports = {
  loadUsers, saveUsers,
  signAccess, signRefresh, verifyAccess, verifyRefresh,
  generateToken, verifyToken,
  ACCESS_SECRET, REFRESH_SECRET,
};
