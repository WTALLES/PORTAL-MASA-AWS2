const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { uploadNewsImage } = require('../middlewares/uploadMiddleware');
const c = require('../controllers/newsController');

router.get('/',        c.getAll);        // público
router.get('/:id',     c.getOne);        // público

router.post('/',   auth, uploadNewsImage.single('image'), c.create);   // admin
router.put('/:id', auth, uploadNewsImage.single('image'), c.update);   // admin
router.delete('/:id', auth, c.remove); // admin (alterado de delete para remove)

module.exports = router;
