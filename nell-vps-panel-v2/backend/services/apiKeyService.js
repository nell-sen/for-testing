/**
 * API Key service — issue/revoke per-user API keys.
 * Keys are stored hashed (bcrypt) in storage/apikeys.json.
 * Plaintext key shown ONCE on creation.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const storage = require('../utils/storage');
const { loadUsers } = require('../config/auth');

const FILE = 'apikeys.json';
function load() { return storage.read(FILE, []); }
function save(list) { storage.write(FILE, list); }

function generate() {
  const raw = 'nell_' + crypto.randomBytes(24).toString('hex');
  return raw;
}

exports.create = (userId, name) => {
  const raw = generate();
  const hash = bcrypt.hashSync(raw, 10);
  const item = { id: uuid(), userId, name, hash, prefix: raw.slice(0, 12), createdAt: new Date().toISOString() };
  const list = load();
  list.push(item);
  save(list);
  return { ...item, key: raw }; // raw shown only once
};

exports.list = (userId) =>
  load().filter(k => k.userId === userId).map(({ hash, ...rest }) => rest);

exports.revoke = (userId, keyId) => {
  const list = load();
  const next = list.filter(k => !(k.id === keyId && k.userId === userId));
  save(next);
  return list.length !== next.length;
};

exports.resolveUser = (rawKey) => {
  if (!rawKey || typeof rawKey !== 'string') return null;
  const list = load();
  const prefix = rawKey.slice(0, 12);
  const candidates = list.filter(k => k.prefix === prefix);
  for (const c of candidates) {
    if (bcrypt.compareSync(rawKey, c.hash)) {
      const user = loadUsers().find(u => u.id === c.userId);
      if (user) return { id: user.id, username: user.username, role: user.role, viaApiKey: true };
    }
  }
  return null;
};
