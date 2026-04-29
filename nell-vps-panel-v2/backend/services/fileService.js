/**
 * File Service v2.0 — secure file ops scoped under /bots/<id>/.
 * - Path traversal protection (resolveSafe)
 * - List, read, write, delete, mkdir, rename
 * - Upload (multer in route)
 * - Backup as ZIP
 */
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { BOTS_DIR } = require('./botService');

function botRoot(botId) {
  return path.join(BOTS_DIR, botId);
}

/**
 * Resolve a relative path safely under the bot root.
 * Throws if attempting to escape.
 */
function resolveSafe(botId, rel = '.') {
  const root = botRoot(botId);
  const target = path.resolve(root, rel || '.');
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const err = new Error('Path traversal detected'); err.status = 400; throw err;
  }
  return target;
}

async function list(botId, rel = '.') {
  const dir = resolveSafe(botId, rel);
  await fs.ensureDir(dir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return Promise.all(entries.map(async (e) => {
    const full = path.join(dir, e.name);
    const stat = await fs.stat(full).catch(() => null);
    return {
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
      size: stat?.size ?? 0,
      modified: stat?.mtime ?? null,
    };
  }));
}

async function read(botId, rel) {
  const p = resolveSafe(botId, rel);
  const stat = await fs.stat(p);
  if (stat.isDirectory()) throw Object.assign(new Error('Is a directory'), { status: 400 });
  if (stat.size > 5 * 1024 * 1024) throw Object.assign(new Error('File too large to preview'), { status: 413 });
  return fs.readFile(p, 'utf-8');
}

async function write(botId, rel, content) {
  const p = resolveSafe(botId, rel);
  await fs.ensureDir(path.dirname(p));
  await fs.writeFile(p, content, 'utf-8');
  return true;
}

async function remove(botId, rel) {
  const p = resolveSafe(botId, rel);
  await fs.remove(p);
  return true;
}

async function mkdir(botId, rel) {
  const p = resolveSafe(botId, rel);
  await fs.ensureDir(p);
  return true;
}

async function rename(botId, from, to) {
  const a = resolveSafe(botId, from);
  const b = resolveSafe(botId, to);
  await fs.move(a, b, { overwrite: false });
  return true;
}

function zipBot(botId, res) {
  const root = botRoot(botId);
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment(`bot-${botId}.zip`);
  archive.pipe(res);
  archive.directory(root, false);
  return archive.finalize();
}

module.exports = { resolveSafe, list, read, write, remove, mkdir, rename, zipBot, botRoot };
