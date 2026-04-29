/**
 * Logger — colored console + optional file output.
 * Backward compatible with v1 (info/warn/error/debug).
 */
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m', gray: '\x1b[90m', red: '\x1b[31m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m'
};
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT = LEVELS[(process.env.LOG_LEVEL || 'info').toLowerCase()] ?? 1;

const LOG_DIR = path.join(__dirname, '..', 'storage', 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, 'server.log');

function ts() { return new Date().toISOString(); }
function write(level, color, ...args) {
  if (LEVELS[level] < CURRENT) return;
  const line = `[${ts()}] [${level.toUpperCase()}] ${args.join(' ')}`;
  // eslint-disable-next-line no-console
  console.log(`${COLORS[color]}${line}${COLORS.reset}`);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch { /* ignore */ }
}

module.exports = {
  debug: (...a) => write('debug', 'gray', ...a),
  info:  (...a) => write('info',  'cyan', ...a),
  warn:  (...a) => write('warn',  'yellow', ...a),
  error: (...a) => write('error', 'red', ...a),
  success: (...a) => write('info', 'green', ...a),
};
