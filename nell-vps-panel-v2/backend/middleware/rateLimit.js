/**
 * Rate limiters — per-IP defense against brute force / abuse.
 */
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, slow down.' },
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, try again later.' },
});
