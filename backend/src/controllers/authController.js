const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const { rows } = await pool.query(
    'SELECT * FROM admins WHERE email = $1', [email]
  );
  const admin = rows[0];

  if (!admin || !(await bcrypt.compare(password, admin.password_hash)))
    return res.status(401).json({ error: 'Credenciais inválidas' });

  // AQUI FOI ADICIONADO admin.role NO TOKEN
  const token = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
};
