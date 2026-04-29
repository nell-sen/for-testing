/**
 * Auth controller — login / refresh / me / change-password / users CRUD (admin).
 */
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { loadUsers, saveUsers, signAccess, signRefresh, verifyRefresh } = require('../config/auth');
const { ok, fail, created } = require('../utils/response');

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = loadUsers().find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return fail(res, 401, 'Invalid credentials');
  }
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  // Backward compat: also return `token`
  return ok(res, {
    token: accessToken,
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role },
  }, 'Login successful');
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  const decoded = verifyRefresh(refreshToken);
  if (!decoded) return fail(res, 401, 'Invalid refresh token');
  const user = loadUsers().find(u => u.id === decoded.sub);
  if (!user) return fail(res, 401, 'User not found');
  return ok(res, {
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  }, 'Token refreshed');
};

exports.me = (req, res) => ok(res, req.user);

exports.logout = (_req, res) => ok(res, null, 'Logged out');

exports.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const users = loadUsers();
  const u = users.find(x => x.id === req.user.id);
  if (!u) return fail(res, 404, 'User not found');
  if (!bcrypt.compareSync(oldPassword, u.password)) return fail(res, 401, 'Old password incorrect');
  u.password = bcrypt.hashSync(newPassword, 10);
  saveUsers(users);
  return ok(res, null, 'Password changed');
};

// ── Admin user management ─────────────────────────────────────
exports.listUsers = (_req, res) => {
  const users = loadUsers().map(({ password, ...u }) => u);
  return ok(res, users);
};

exports.createUser = (req, res) => {
  const { username, password, role } = req.body;
  const users = loadUsers();
  if (users.some(u => u.username === username)) return fail(res, 409, 'Username exists');
  const u = { id: uuid(), username, password: bcrypt.hashSync(password, 10), role, createdAt: new Date().toISOString() };
  users.push(u);
  saveUsers(users);
  const { password: _, ...safe } = u;
  return created(res, safe, 'User created');
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;
  const users = loadUsers();
  const next = users.filter(u => u.id !== id);
  if (next.length === users.length) return fail(res, 404, 'User not found');
  saveUsers(next);
  return ok(res, null, 'User deleted');
};
