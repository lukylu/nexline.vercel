const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'void-streetwear-tfg-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Password';

/**
 * Middleware específico para autenticación de admin con contraseña
 * Verifica la contraseña directamente (sin JWT para el login inicial)
 */
const verifyAdminPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  next();
};

/**
 * Genera un token JWT para admin (sin expiración)
 */
const generateAdminToken = () => {
  return jwt.sign(
    { id: 0, email: 'admin@void.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '9999d' }  // Prácticamente sin expiración
  );
};

/**
 * Genera un token JWT para usuario normal
 */
const generateUserToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '9999d' }  // Prácticamente sin expiración
  );
};

module.exports = {
  verifyAdminPassword,
  generateAdminToken,
  generateUserToken,
  JWT_SECRET
};
