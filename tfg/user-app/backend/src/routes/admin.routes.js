const express = require('express');
const router = express.Router();
const { verifyAdminPassword, generateAdminToken } = require('../middleware/admin.middleware');
const ProductModel = require('../models/product.model');
const OrderModel = require('../models/order.model');
const UserModel = require('../models/user.model');

// POST /api/admin/login - Login admin con contraseña
router.post('/login', verifyAdminPassword, (req, res) => {
  const token = generateAdminToken();
  res.json({
    message: 'Acceso de administrador correcto',
    token,
    role: 'admin'
  });
});

// GET /api/admin/dashboard - Estadísticas del dashboard
router.get('/dashboard', (req, res) => {
  try {
    const products = ProductModel.findAll();
    const orders = OrderModel.findAll();
    const users = UserModel.findAll();

    // Calcular estadísticas
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    res.json({
      stats: {
        totalRevenue,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalOrders: orders.length,
        totalUsers: users.length
      },
      recentOrders: orders.slice(0, 10),
      lowStockProducts: products.filter(p => p.stock < 10)
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/admin/users - Listar usuarios
router.get('/users', (req, res) => {
  try {
    const users = UserModel.findAll();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
