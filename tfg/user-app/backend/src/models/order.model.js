const { getOne, getAll, runQuery, getDb, saveDatabase } = require('./database');
const ProductModel = require('./product.model');

const OrderModel = {
  create(userId, total, status = 'pending', shippingAddress = '{}', paymentData = '{}') {
    const stmt = getDb().prepare(`
      INSERT INTO orders (user_id, total, status, shipping_address, payment_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([userId, total, status, shippingAddress, paymentData]);
    stmt.free();
    saveDatabase();

    const result = getOne('SELECT last_insert_rowid() as id');
    return { id: result.id, user_id: userId, total, status, created_at: new Date() };
  },

  findById(id) {
    return getOne('SELECT * FROM orders WHERE id = ?', [id]);
  },

  findByUserId(userId) {
    return getAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },

  findAll() {
    return getAll('SELECT * FROM orders ORDER BY created_at DESC');
  },

  updateStatus(id, status) {
    runQuery('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  },

  createItem(orderId, productId, size, quantity, price) {
    const stmt = getDb().prepare(`
      INSERT INTO order_items (order_id, product_id, size, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([orderId, productId, size, quantity, price]);
    stmt.free();
    saveDatabase();
  },

  getItemsByOrderId(orderId) {
    return getAll(`
      SELECT oi.*, p.name, p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
  },

  // Crear pedido completo con items
  createWithItems(userId, total, items, shippingAddress, paymentData) {
    const db = getDb();

    // Crear pedido
    const orderStmt = db.prepare(`
      INSERT INTO orders (user_id, total, status, shipping_address, payment_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    orderStmt.run([userId, total, 'pending', JSON.stringify(shippingAddress), JSON.stringify(paymentData)]);
    const orderId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    orderStmt.free();

    // Crear items y actualizar stock
    for (const item of items) {
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, size, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `);
      itemStmt.run([orderId, item.product_id, item.size, item.quantity, item.price]);
      itemStmt.free();

      // Actualizar stock
      ProductModel.updateStock(item.product_id, item.quantity);
    }

    saveDatabase();
    return { id: orderId, user_id: userId, total, status: 'pending' };
  },

  delete(id) {
    runQuery('DELETE FROM orders WHERE id = ?', [id]);
  }
};

module.exports = OrderModel;
