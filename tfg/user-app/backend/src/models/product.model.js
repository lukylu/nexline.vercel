const { getOne, getAll, runQuery, getDb, saveDatabase } = require('./database');

const ProductModel = {
  create(name, description, price, category, images = '[]', sizes = '[]', stock = 0, isFeatured = 0) {
    const stmt = getDb().prepare(`
      INSERT INTO products (name, description, price, category, images, sizes, stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([name, description, price, category, images, sizes, stock, isFeatured ? 1 : 0]);
    stmt.free();
    saveDatabase();

    const result = getOne('SELECT last_insert_rowid() as id');
    return { id: result.id, name, description, price, category, images, sizes, stock, is_featured: isFeatured };
  },

  findById(id) {
    return getOne('SELECT * FROM products WHERE id = ?', [id]);
  },

  findAll() {
    return getAll('SELECT * FROM products ORDER BY created_at DESC');
  },

  findByCategory(category) {
    return getAll('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category]);
  },

  findFeatured() {
    return getAll('SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC');
  },

  update(id, name, description, price, category, images, sizes, stock, isFeatured) {
    runQuery(`
      UPDATE products
      SET name = ?, description = ?, price = ?, category = ?, images = ?, sizes = ?, stock = ?, is_featured = ?
      WHERE id = ?
    `, [name, description, price, category, images, sizes, stock, isFeatured ? 1 : 0, id]);
  },

  delete(id) {
    runQuery('DELETE FROM products WHERE id = ?', [id]);
  },

  search(query) {
    const searchTerm = `%${query}%`;
    return getAll('SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC', [searchTerm, searchTerm]);
  },

  updateStock(id, quantity) {
    runQuery('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id]);
  }
};

module.exports = ProductModel;
