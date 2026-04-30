const express = require('express');
const router = express.Router();
const { register, login, loginAdmin, getMe, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/auth/register - Registro de usuario
router.post('/register', register);

// POST /api/auth/login - Login de usuario
router.post('/login', login);

// POST /api/auth/login-admin - Login de administrador
router.post('/login-admin', loginAdmin);

// GET /api/auth/me - Obtener datos del usuario autenticado
router.get('/me', verifyToken, getMe);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', logout);

module.exports = router;
