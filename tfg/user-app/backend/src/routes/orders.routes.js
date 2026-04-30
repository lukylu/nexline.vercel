const express = require('express');
const router = express.Router();
const {
  create,
  getMyOrders,
  getAll,
  getById,
  updateStatus
} = require('../controllers/orders.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// POST /api/orders - Crear pedido (público o autenticado)
router.post('/', create);

// GET /api/orders/my-orders - Mis pedidos (autenticado)
router.get('/my-orders', verifyToken, getMyOrders);

// GET /api/orders - Todos los pedidos (admin)
router.get('/', verifyToken, requireAdmin, getAll);

// GET /api/orders/:id - Pedido por ID (autenticado)
router.get('/:id', verifyToken, getById);

// PUT /api/orders/:id/status - Actualizar estado (admin)
router.put('/:id/status', verifyToken, requireAdmin, updateStatus);

module.exports = router;
