module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role || 'admin';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Acesso negado: Perfil sem permissão para esta área.' });
    }
    
    next();
  };
};
