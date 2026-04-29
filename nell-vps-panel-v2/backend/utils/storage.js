/**
 * Tiny JSON storage wrapper (atomic writes).
 * Used for persisting users, bots metadata, api keys, refresh tokens.
 */
const fs = require('fs');
const path = require('path');
const STORAGE_DIR = path.join(__dirname, '..', 'storage');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

function file(name) { return path.join(STORAGE_DIR, name); }

function read(name, fallback) {
  try {
    const p = file(name);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch { return fallback; }
}
function write(name, data) {
  const p = file(name);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}
module.exports = { read, write, file, STORAGE_DIR };
