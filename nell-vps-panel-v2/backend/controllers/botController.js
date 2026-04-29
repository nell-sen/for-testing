/**
 * Bot controller — request handlers backed by botService.
 * Backward compatible with v1 endpoints.
 */
const botService = require('../services/botService');
const { ok, fail, created } = require('../utils/response');

exports.list = (req, res) => ok(res, botService.listBots(req.user));

exports.get = (req, res) => {
  const b = botService.getBot(req.params.id);
  if (!b) return fail(res, 404, 'Bot not found');
  if (req.user.role !== 'admin' && b.ownerId !== req.user.id) return fail(res, 403, 'Forbidden');
  return ok(res, b);
};

exports.create = (req, res) => {
  try {
    const meta = botService.createBot({ ...req.body, ownerId: req.user.id });
    return created(res, meta, 'Bot created');
  } catch (e) {
    return fail(res, e.status || 500, e.message);
  }
};

exports.update = (req, res) => {
  const b = botService.getBot(req.params.id);
  if (!b) return fail(res, 404, 'Bot not found');
  if (req.user.role !== 'admin' && b.ownerId !== req.user.id) return fail(res, 403, 'Forbidden');
  return ok(res, botService.updateBot(req.params.id, req.body), 'Bot updated');
};

exports.remove = async (req, res) => {
  const b = botService.getBot(req.params.id);
  if (!b) return fail(res, 404, 'Bot not found');
  if (req.user.role !== 'admin' && b.ownerId !== req.user.id) return fail(res, 403, 'Forbidden');
  await botService.deleteBot(req.params.id);
  return ok(res, null, 'Bot deleted');
};

const lifecycle = (action) => async (req, res) => {
  try {
    const b = botService.getBot(req.params.id);
    if (!b) return fail(res, 404, 'Bot not found');
    if (req.user.role !== 'admin' && b.ownerId !== req.user.id) return fail(res, 403, 'Forbidden');
    const meta = await botService[action](req.params.id);
    return ok(res, meta, `Bot ${action}ed`);
  } catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.start = lifecycle('startBot');
exports.stop = lifecycle('stopBot');
exports.restart = lifecycle('restartBot');

exports.command = async (req, res) => {
  try {
    const b = botService.getBot(req.params.id);
    if (!b) return fail(res, 404, 'Bot not found');
    if (req.user.role !== 'admin' && b.ownerId !== req.user.id) return fail(res, 403, 'Forbidden');
    const r = await botService.runCommand(req.params.id, req.body.command);
    return ok(res, r);
  } catch (e) { return fail(res, 400, e.message); }
};

exports.logs = (req, res) => {
  const b = botService.getBot(req.params.id);
  if (!b) return fail(res, 404, 'Bot not found');
  return ok(res, b.logs || []);
};

exports.templates = (_req, res) => ok(res, botService.getTemplates());
