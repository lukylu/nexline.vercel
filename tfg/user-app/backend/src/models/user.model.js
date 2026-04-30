const { getOne, getAll, runQuery, getDb, saveDatabase } = require('./database');

const UserModel = {
  create(name, email, passwordHash, role = 'user') {
    try {
      const stmt = getDb().prepare(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([name, email, passwordHash, role]);
      stmt.free();
      saveDatabase();

      const result = getOne('SELECT last_insert_rowid() as id');
      return { id: result.id, name, email, role };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  },

  findByEmail(email) {
    return getOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  findById(id) {
    return getOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
  },

  findAll() {
    return getAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  },

  update(id, name, email) {
    runQuery('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  },

  delete(id) {
    runQuery('DELETE FROM users WHERE id = ?', [id]);
  },

  addToWishlist(userId, productId) {
    try {
      runQuery('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    } catch (error) {
      getDb().run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
      saveDatabase();
    }
  },

  removeFromWishlist(userId, productId) {
    runQuery('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
  },

  getWishlist(userId) {
    return getAll(`
      SELECT w.product_id, p.name, p.price, p.images
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [userId]);
  }
};

module.exports = UserModel;
