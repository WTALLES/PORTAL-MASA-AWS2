const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM news';
    const params = [];
    
    if (category && category !== 'Todos') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY published_at DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Notícia não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notícia' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, category, excerpt, content } = req.body;
    
    // ATUALIZAÇÃO: Caminho relativo para funcionar em qualquer IP/Celular
    const image_url = req.file ? `/uploads/news/${req.file.filename}` : null;


    const { rows } = await pool.query(
      'INSERT INTO news (title, category, excerpt, content, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, category, excerpt, content, image_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar notícia' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, excerpt, content } = req.body;
    
    const newsExists = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
    if (newsExists.rows.length === 0) return res.status(404).json({ error: 'Notícia não encontrada' });

    let image_url = newsExists.rows[0].image_url;
    
    if (req.file) {
      // ATUALIZAÇÃO: Caminho relativo
      image_url = `/uploads/news/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      'UPDATE news SET title = $1, category = $2, excerpt = $3, content = $4, image_url = $5 WHERE id = $6 RETURNING *',
      [title, category, excerpt, content, image_url, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar notícia' });
  }
};

exports.remove = async (req, res) => {

  try {
    const { id } = req.params;
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
    res.json({ message: 'Notícia excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir notícia' });
  }
};
