/**
 * Standardized JSON response helpers.
 * Shape: { success, data?, message?, error?, meta? }
 */
exports.ok = (res, data, message = 'OK', meta) =>
  res.json({ success: true, data, message, ...(meta ? { meta } : {}) });

exports.created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, data, message });

exports.fail = (res, status, message, error) =>
  res.status(status).json({ success: false, message, ...(error ? { error } : {}) });
