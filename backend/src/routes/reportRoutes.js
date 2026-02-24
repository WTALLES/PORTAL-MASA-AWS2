const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware'); // NOVO MIDDLEWARE
const { uploadReportFiles } = require('../middlewares/uploadMiddleware');
const c = require('../controllers/reportController');

router.post('/', uploadReportFiles.array('files', 5), c.create); // público
router.get('/check/:protocol', c.checkProtocol); // público
router.get('/public', c.getPublicReports); // público

// ROTAS EXCLUSIVAS PARA ADMINISTRADOR (Editor de notícias não passa daqui)
router.get('/admin/all', auth, requireRole('admin'), c.getAllAdmin); 
router.get('/admin/:id', auth, requireRole('admin'), c.getOneAdmin); 
router.put('/admin/:id/status', auth, requireRole('admin'), c.updateStatus); 

module.exports = router;
