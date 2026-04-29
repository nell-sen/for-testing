/**
 * Docker sandbox executor — runs each bot in an isolated container with
 * CPU/memory limits and a restricted bind mount.
 *
 * Falls back to child_process if docker is unavailable.
 */
const Docker = require('dockerode');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let docker = null;
let dockerAvailable = false;
try {
  docker = new Docker();
} catch (e) {
  logger.warn('Docker not initialized:', e.message);
}

async function ping() {
  if (!docker) return false;
  try { await docker.ping(); dockerAvailable = true; return true; }
  catch { dockerAvailable = false; return false; }
}

const IMAGE = process.env.DOCKER_IMAGE || 'node:20-alpine';
const MEM = process.env.DOCKER_MEMORY_LIMIT || '256m';
const CPU = parseFloat(process.env.DOCKER_CPU_LIMIT || '0.5');
const NET = process.env.DOCKER_NETWORK || 'bridge';

function memToBytes(s) {
  const m = String(s).match(/^(\d+)([kmg]?)$/i);
  if (!m) return 256 * 1024 * 1024;
  const n = parseInt(m[1], 10);
  const u = (m[2] || '').toLowerCase();
  return n * ({ '': 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 }[u]);
}

/**
 * Start a container. Returns { container, stream } and pipes stdout/stderr
 * via onLog(line) callback.
 */
async function startContainer({ botId, botDir, entry, onLog, onExit }) {
  if (!fs.existsSync(botDir)) throw new Error('Bot directory does not exist');
  if (!await ping()) throw new Error('Docker not available');

  const container = await docker.createContainer({
    Image: IMAGE,
    name: `nell-bot-${botId}-${Date.now()}`,
    Cmd: ['node', entry || 'index.js'],
    WorkingDir: '/bot',
    Tty: false,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: false,
    HostConfig: {
      Binds: [`${botDir}:/bot`],
      Memory: memToBytes(MEM),
      NanoCpus: Math.floor(CPU * 1e9),
      NetworkMode: NET,
      AutoRemove: true,
      RestartPolicy: { Name: 'no' },
      ReadonlyRootfs: false,
      SecurityOpt: ['no-new-privileges'],
      PidsLimit: 200,
    },
  });

  const stream = await container.attach({ stream: true, stdout: true, stderr: true });
  // Demux Docker stream: 8-byte header per chunk
  stream.on('data', (chunk) => {
    let offset = 0;
    while (offset < chunk.length) {
      if (chunk.length - offset < 8) break;
      const size = chunk.readUInt32BE(offset + 4);
      const payload = chunk.slice(offset + 8, offset + 8 + size).toString('utf-8');
      offset += 8 + size;
      payload.split(/\r?\n/).forEach(l => l && onLog && onLog(l));
    }
  });

  await container.start();

  container.wait().then(({ StatusCode }) => {
    onExit && onExit(StatusCode);
  }).catch(e => onExit && onExit(-1, e.message));

  return { container };
}

async function stopContainer(container) {
  try { await container.stop({ t: 5 }); } catch { /* may already be stopped */ }
  try { await container.remove({ force: true }); } catch { /* ignore */ }
}

module.exports = { ping, startContainer, stopContainer, get available() { return dockerAvailable; } };
