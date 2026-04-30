const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'void-streetwear-tfg-secret-key-2026';

/**
 * Middleware para verificar token JWT
 * Si es válido, añade user al request
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para verificar que el usuario es admin
 * Debe usarse después de verifyToken
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

/**
 * Middleware opcional: intenta autenticar pero no falla si no hay token
 * Útil para endpoints públicos que quieren mostrar datos personalizados
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token inválido, pero continuamos sin usuario
    }
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
};
