const pool = require('../config/db');
const crypto = require('crypto');

const genProtocol = () =>
  'MASA-' + Date.now().toString(36).toUpperCase() +
  '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

// --- PÚBLICO ---
exports.create = async (req, res) => {
  const {
    type, relation, area, category, subject, message,
    occurrence_date, is_identified,
    reporter_name, reporter_email, reporter_phone
  } = req.body;

  if (!type || !relation || !area || !subject || !message)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  const protocol = genProtocol();
  const identified = is_identified === 'true' || is_identified === true;

  const attachedFiles = req.files
    ? req.files.map(f => ({ name: f.originalname, size: f.size, path: f.filename }))
    : [];

  const { rows } = await pool.query(
    `INSERT INTO reports
     (protocol, type, relation, area, category, subject, message,
      occurrence_date, is_identified, reporter_name, reporter_email,
      reporter_phone, attached_files)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING protocol, status, created_at`,
    [protocol, type, relation, area, category, subject, message,
     occurrence_date || null, identified,
     identified ? reporter_name : null,
     identified ? reporter_email : null,
     identified ? reporter_phone : null,
     JSON.stringify(attachedFiles)]
  );
  res.status(201).json(rows[0]);
};

exports.checkProtocol = async (req, res) => {
  const { protocol } = req.params;
  const { rows } = await pool.query(
    `SELECT protocol, status, subject, created_at, updated_at
     FROM reports WHERE protocol = $1`, [protocol]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Protocolo não encontrado' });
  res.json(rows[0]);
};


// Retorna a lista pública de denúncias (últimos 7 dias) ocultando dados sensíveis
exports.getPublicReports = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id, 
           CONCAT(SUBSTRING(protocol, 1, 9), '****') as protocol, -- Oculta parte do protocolo
           type, 
           subject, 
           status, 
           created_at 
    FROM reports 
    WHERE created_at >= NOW() - INTERVAL '7 days'
    ORDER BY created_at DESC
  `);
  res.json(rows);
};


// --- ADMIN ---
exports.getAllAdmin = async (req, res) => {
  // Lista todos os relatórios, ordenado por data desc
  const { status, protocol } = req.query;
  let query = `SELECT id, protocol, type, relation, area, category, subject,
               is_identified, status, created_at, updated_at
               FROM reports`;
  const params = [];
  let whereAdded = false;
  if (status) { 
    params.push(status); 
    query += ` WHERE status = $${params.length}`; 
    whereAdded = true;
  }
  if (protocol) { 
    params.push(`%${protocol}%`); 
    query += `${whereAdded ? ' AND' : ' WHERE'} protocol ILIKE $${params.length}`; 
  }
  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);
  res.json(rows);
};

exports.getOneAdmin = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM reports WHERE id = $1', [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Relatório não encontrado' });
  res.json(rows[0]);
};

exports.updateStatus = async (req, res) => {
  const { status, admin_notes } = req.body;
  const allowed = ['Recebido','Em análise','Concluído','Arquivado'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: 'Status inválido' });
  const { rows } = await pool.query(
    `UPDATE reports SET status=$1, admin_notes=$2, updated_at=NOW()
     WHERE id=$3 RETURNING *`,
    [status, admin_notes, req.params.id]
  );
  res.json(rows[0]);
};
