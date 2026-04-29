/**
 * Centralized error handler. Always returns standard JSON.
 */
const logger = require('../utils/logger');
module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${req.method} ${req.path} —`, err.message);
  if (process.env.DEBUG === 'true') logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
