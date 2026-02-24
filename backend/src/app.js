require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const newsRoutes = require('./routes/newsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Pasta pública do frontend
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// Rotas da API
app.use('/api/news', newsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📂 Pasta de uploads apontando para: ${uploadsPath}`);
  console.log(`🌐 Acesse o sistema pelo IP da máquina: http://192.168.X.X:${PORT}`);
});
