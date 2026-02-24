const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante o caminho absoluto para a pasta uploads na raiz do back-end
const baseUploadDir = path.resolve(__dirname, '..', '..', 'uploads');

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    // Ex: backend/uploads/news
    const dir = path.join(baseUploadDir, folder);
    
    // Cria a pasta se não existir
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

exports.uploadNewsImage = multer({
  storage: storage('news'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  }
});

exports.uploadReportFiles = multer({
  storage: storage('reports'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido'));
  }
});

exports.uploadDocument = multer({
  storage: storage('documents'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas PDFs são permitidos'));
  }
});
