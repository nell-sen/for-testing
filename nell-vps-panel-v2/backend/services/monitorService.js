/**
 * Monitor Service v2.0 — system stats (CPU, RAM, disk, uptime).
 * Broadcasts to Socket.IO room "system" every 2 seconds.
 * Cached in-memory.
 */
const si = require('systeminformation');
const os = require('os');
const cache = require('../utils/cache');

let timer = null;

async function snapshot() {
  const cached = cache.get('system:snapshot');
  if (cached) return cached;
  const [cpu, mem, fs] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize().catch(() => []),
  ]);
  const disk = fs[0] || { size: 0, used: 0 };
  const data = {
    cpu: {
      load: +cpu.currentLoad.toFixed(2),
      cores: os.cpus().length,
    },
    memory: {
      total: mem.total,
      used: mem.active,
      free: mem.available,
      percent: +((mem.active / mem.total) * 100).toFixed(2),
    },
    disk: {
      total: disk.size,
      used: disk.used,
      percent: disk.size ? +((disk.used / disk.size) * 100).toFixed(2) : 0,
    },
    uptime: os.uptime(),
    platform: os.platform(),
    hostname: os.hostname(),
    timestamp: Date.now(),
  };
  cache.set('system:snapshot', data, 2);
  return data;
}

function startMonitoring(intervalMs = 2000) {
  if (timer) return;
  timer = setInterval(async () => {
    try {
      const data = await snapshot();
      if (global.io) global.io.to('system').emit('system:stats', data);
    } catch { /* ignore */ }
  }, intervalMs);
}

function stopMonitoring() { if (timer) clearInterval(timer); timer = null; }

module.exports = { snapshot, startMonitoring, stopMonitoring };
