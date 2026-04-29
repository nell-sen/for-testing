/**
 * System controller — exposes monitor snapshot.
 */
const monitor = require('../services/monitorService');
const { ok, fail } = require('../utils/response');

exports.stats = async (_req, res) => {
  try { return ok(res, await monitor.snapshot()); }
  catch (e) { return fail(res, 500, e.message); }
};
// Backward compat alias used by v1 frontend
exports.resources = exports.stats;
