/**
 * API key controller.
 */
const svc = require('../services/apiKeyService');
const { ok, fail, created } = require('../utils/response');

exports.list = (req, res) => ok(res, svc.list(req.user.id));
exports.create = (req, res) => {
  const item = svc.create(req.user.id, req.body.name);
  return created(res, item, 'API key created — save it now, it will not be shown again.');
};
exports.revoke = (req, res) => {
  const okDel = svc.revoke(req.user.id, req.params.id);
  if (!okDel) return fail(res, 404, 'Key not found');
  return ok(res, null, 'Revoked');
};
