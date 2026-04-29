const router = require('express').Router();
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { loginSchema, refreshSchema, registerSchema, changePasswordSchema } = require('../validators/schemas');

router.post('/login',   authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', authLimiter, validate(refreshSchema), ctrl.refresh);
router.post('/logout',  requireAuth, ctrl.logout);
router.get('/me',       requireAuth, ctrl.me);
router.post('/change-password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

// Admin user management
router.get('/users',           requireAuth, requireRole('admin'), ctrl.listUsers);
router.post('/users',          requireAuth, requireRole('admin'), validate(registerSchema), ctrl.createUser);
router.delete('/users/:id',    requireAuth, requireRole('admin'), ctrl.deleteUser);

module.exports = router;
