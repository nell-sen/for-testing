/**
 * File controller — CRUD files inside a bot directory.
 */
const fileService = require('../services/fileService');
const botService = require('../services/botService');
const { ok, fail } = require('../utils/response');

function authorize(req, res) {
  const b = botService.getBot(req.params.id);
  if (!b) { fail(res, 404, 'Bot not found'); return null; }
  if (req.user.role !== 'admin' && b.ownerId !== req.user.id) { fail(res, 403, 'Forbidden'); return null; }
  return b;
}

exports.list = async (req, res) => {
  if (!authorize(req, res)) return;
  try { return ok(res, await fileService.list(req.params.id, req.query.path || '.')); }
  catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.read = async (req, res) => {
  if (!authorize(req, res)) return;
  try { return ok(res, await fileService.read(req.params.id, req.query.path)); }
  catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.write = async (req, res) => {
  if (!authorize(req, res)) return;
  try { await fileService.write(req.params.id, req.body.path, req.body.content); return ok(res, null, 'Saved'); }
  catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.remove = async (req, res) => {
  if (!authorize(req, res)) return;
  try { await fileService.remove(req.params.id, req.body.path); return ok(res, null, 'Deleted'); }
  catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.mkdir = async (req, res) => {
  if (!authorize(req, res)) return;
  try { await fileService.mkdir(req.params.id, req.body.path); return ok(res, null, 'Created'); }
  catch (e) { return fail(res, e.status || 500, e.message); }
};

exports.upload = async (req, res) => {
  if (!authorize(req, res)) return;
  if (!req.file) return fail(res, 400, 'No file');
  // multer already saved to bot directory via destination
  return ok(res, { name: req.file.originalname, size: req.file.size }, 'Uploaded');
};

exports.download = (req, res) => {
  if (!authorize(req, res)) return;
  return fileService.zipBot(req.params.id, res);
};
