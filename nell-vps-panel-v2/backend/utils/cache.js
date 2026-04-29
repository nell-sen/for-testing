/**
 * In-memory cache (NodeCache wrapper) — used for system stats, bot status.
 */
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10, useClones: false });
module.exports = cache;
