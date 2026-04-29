const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const ctrl = require('../controllers/fileController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { fileWriteSchema, filePathSchema } = require('../validators/schemas');
const fileService = require('../services/fileService');

const LIMIT_MB = parseInt(process.env.LIMIT_FILE_UPLOAD_MB || '50', 10);

// Upload — save inside bot dir, sanitize filename, prevent traversal
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const target = fileService.resolveSafe(req.params.id, req.query.path || '.');
      fs.ensureDirSync(target);
      cb(null, target);
    } catch (e) { cb(e); }
  },
  filename: (_req, file, cb) => cb(null, path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')),
});
const upload = multer({ storage, limits: { fileSize: LIMIT_MB * 1024 * 1024 } });

router.use(requireAuth);

router.get('/:id',          ctrl.list);                             // ?path=
router.get('/:id/read',     ctrl.read);                             // ?path=
router.post('/:id/write',   validate(fileWriteSchema), ctrl.write);
router.post('/:id/mkdir',   validate(filePathSchema), ctrl.mkdir);
router.post('/:id/delete',  validate(filePathSchema), ctrl.remove);
router.post('/:id/upload',  upload.single('file'), ctrl.upload);
router.get('/:id/download', ctrl.download);

module.exports = router;
