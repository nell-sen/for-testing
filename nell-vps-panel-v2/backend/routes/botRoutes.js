const router = require('express').Router();
const ctrl = require('../controllers/botController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { botCreateSchema, botUpdateSchema, commandSchema } = require('../validators/schemas');

router.use(requireAuth);

router.get('/templates', ctrl.templates);
router.get('/',          ctrl.list);
router.post('/',         validate(botCreateSchema), ctrl.create);
router.get('/:id',       ctrl.get);
router.patch('/:id',     validate(botUpdateSchema), ctrl.update);
router.delete('/:id',    ctrl.remove);

router.post('/:id/start',   ctrl.start);
router.post('/:id/stop',    ctrl.stop);
router.post('/:id/restart', ctrl.restart);
router.post('/:id/command', validate(commandSchema), ctrl.command);
router.get('/:id/logs',     ctrl.logs);

module.exports = router;
