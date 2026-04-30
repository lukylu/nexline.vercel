const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { generateUserToken, generateAdminToken } = require('../middleware/admin.middleware');

/**
 * Registro de usuario
 * POST /api/auth/register
 */
const register = (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Hash de contraseña
    const passwordHash = bcrypt.hashSync(password, 10);

    // Crear usuario
    const user = UserModel.create(name, email, passwordHash);

    // Generar token JWT
    const token = generateUserToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message || 'Error al registrar usuario' });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = UserModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const validPassword = bcrypt.compareSync(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = generateUserToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Login correcto',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

/**
 * Login de administrador (con contraseña simple)
 * POST /api/auth/login-admin
 */
const loginAdmin = (req, res) => {
  try {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Password';

    if (!password) {
      return res.status(400).json({ error: 'Contraseña requerida' });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token admin
    const token = generateAdminToken();

    res.json({
      message: 'Acceso de administrador correcto',
      token,
      role: 'admin'
    });
  } catch (error) {
    console.error('Error en login admin:', error);
    res.status(500).json({ error: 'Error al iniciar sesión como admin' });
  }
};

/**
 * Verificar token y obtener datos del usuario
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  try {
    // req.user ya viene del middleware verifyToken
    const user = UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

/**
 * Logout de usuario
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {
  register,
  login,
  loginAdmin,
  getMe,
  logout
};
