const OrderModel = require('../models/order.model');
const UserModel = require('../models/user.model');
const ProductModel = require('../models/product.model');

/**
 * Crear pedido
 * POST /api/orders
 */
const create = (req, res) => {
  try {
    const { items, shippingAddress, paymentData } = req.body;
    const userId = req.user ? req.user.id : null;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
    }

    // Calcular total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // Añadir envío gratis si supera 60€
    const shippingCost = total >= 60 ? 0 : 4.95;
    const finalTotal = total + shippingCost;

    // Preparar items para la BD y verificar stock
    const orderItems = [];
    for (const item of items) {
      const product = ProductModel.findById(item.id);
      if (!product) {
        return res.status(404).json({ error: `Producto con ID ${item.id} no encontrado` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      }

      orderItems.push({
        product_id: item.id,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Crear pedido con items
    const order = OrderModel.createWithItems(
      userId,
      finalTotal,
      orderItems,
      shippingAddress || {},
      paymentData || {}
    );

    res.status(201).json({
      message: 'Pedido creado correctamente',
      order: {
        ...order,
        items: orderItems,
        shipping_cost: shippingCost
      }
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
};

/**
 * Obtener pedidos del usuario autenticado
 * GET /api/orders/my-orders
 */
const getMyOrders = (req, res) => {
  try {
    const userId = req.user.id;
    const orders = OrderModel.findByUserId(userId);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: OrderModel.getItemsByOrderId(order.id)
    }));

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

/**
 * Obtener todos los pedidos (admin)
 * GET /api/orders
 */
const getAll = (req, res) => {
  try {
    const orders = OrderModel.findAll();

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: OrderModel.getItemsByOrderId(order.id),
      user: UserModel.findById(order.user_id)
    }));

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

/**
 * Obtener pedido por ID
 * GET /api/orders/:id
 */
const getById = (req, res) => {
  try {
    const { id } = req.params;
    const order = OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      order: {
        ...order,
        items: OrderModel.getItemsByOrderId(id)
      }
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

/**
 * Actualizar estado del pedido (admin)
 * PUT /api/orders/:id/status
 */
const updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` });
    }

    const order = OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    OrderModel.updateStatus(id, status);

    res.json({ message: 'Estado del pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
};

module.exports = {
  create,
  getMyOrders,
  getAll,
  getById,
  updateStatus
};
