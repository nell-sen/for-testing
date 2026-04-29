/**
 * Joi schemas — single source of truth for input validation.
 */
const Joi = require('joi');

exports.loginSchema = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  password: Joi.string().min(3).max(128).required(),
});

exports.refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

exports.registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(32).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'user').default('user'),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

exports.botCreateSchema = Joi.object({
  name: Joi.string().min(1).max(64).pattern(/^[a-zA-Z0-9_\- ]+$/).required(),
  type: Joi.string().valid('whatsapp', 'telegram', 'discord', 'custom').default('custom'),
  entry: Joi.string().max(128).default('index.js'),
  template: Joi.string().max(64).optional(),
});

exports.botUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(64).optional(),
  entry: Joi.string().max(128).optional(),
  autoRestart: Joi.boolean().optional(),
});

exports.commandSchema = Joi.object({
  command: Joi.string().min(1).max(500).required(),
});

exports.fileWriteSchema = Joi.object({
  path: Joi.string().min(1).max(512).required(),
  content: Joi.string().allow('').max(5 * 1024 * 1024).required(),
});

exports.filePathSchema = Joi.object({
  path: Joi.string().min(1).max(512).required(),
});

exports.apiKeyCreateSchema = Joi.object({
  name: Joi.string().min(1).max(64).required(),
});
