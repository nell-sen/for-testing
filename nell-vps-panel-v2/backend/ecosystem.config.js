/**
 * PM2 ecosystem — auto-restart panel on crash.
 * Usage: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [{
    name: 'nell-vps-panel',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
  }],
};
