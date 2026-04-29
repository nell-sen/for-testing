const router = require('express').Router();
const ctrl = require('../controllers/apiKeyController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { apiKeyCreateSchema } = require('../validators/schemas');

router.use(requireAuth);
router.get('/',         ctrl.list);
router.post('/',        validate(apiKeyCreateSchema), ctrl.create);
router.delete('/:id',   ctrl.revoke);

module.exports = router;
