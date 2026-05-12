const Order = require('../models/Order');
const Product = require('../models/Product');

const create = async (req, res) => {
  try {
    const { items, total, shipping_address, payment_intent_id } = req.body;
    
    const order = new Order({
      items,
      total,
      shipping_address,
      payment_intent_id,
      status: 'paid'
    });

    await order.save();

    // Actualizar stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { create, getMyOrders };
