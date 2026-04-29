const router = require('express').Router();
const ctrl = require('../controllers/systemController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/stats',     ctrl.stats);
router.get('/resources', ctrl.resources); // v1 alias

module.exports = router;
