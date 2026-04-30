const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;

// Asegurar que existe el directorio de database
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'void.db');

// Cargar o crear base de datos
const loadDatabase = async () => {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Base de datos cargada desde:', dbPath);
  } else {
    db = new SQL.Database();
    console.log('🆕 Nueva base de datos creada');
  }
};

// Guardar base de datos a disco
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Habilitar foreign keys
const enableForeignKeys = () => {
  db.run('PRAGMA foreign_keys = ON;');
};

// Crear tablas
const createTables = () => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de productos
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      old_price REAL,
      category TEXT NOT NULL,
      images TEXT,
      sizes TEXT,
      color TEXT,
      badge TEXT,
      stock INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      payment_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tabla de líneas de pedido
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      size TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Tabla de wishlist
  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist (
      user_id INTEGER,
      product_id INTEGER,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  console.log('✅ Tablas creadas correctamente');
};

// Insertar datos de ejemplo si está vacía la BD
const seedData = () => {
  const productsCount = db.exec('SELECT COUNT(*) as count FROM products');
  const count = productsCount.length > 0 ? productsCount[0].values[0][0] : 0;

  if (count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, old_price, category, images, sizes, color, badge, stock, is_featured)
      VALUES ($name, $description, $price, $old_price, $category, $images, $sizes, $color, $badge, $stock, $is_featured)
    `);

    // Productos iniciales
    const initialProducts = [
      { name: "Billiard Tee", description: "100% combed ring-spun cotton. Oversized drop-shoulder cut. Screen-printed graphics.", price: 55, old_price: null, stock: 100, category: "tees", badge: "new", color: "Navy", sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "Gods Of Love Tee", description: "100% combed ring-spun cotton. Oversized drop-shoulder cut. Screen-printed graphics.", price: 55, old_price: null, stock: 100, category: "tees", badge: "new", color: "Cream", sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "Ice Cube Tee", description: "100% combed ring-spun cotton. Oversized drop-shoulder cut. Screen-printed graphics.", price: 50, old_price: null, stock: 100, category: "tees", badge: "hot", color: "White", sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "Ice Heart Tee", description: "100% combed ring-spun cotton. Oversized drop-shoulder cut. Screen-printed graphics.", price: 55, old_price: null, stock: 100, category: "tees", badge: "new", color: "Black", sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "Red Dice Tee", description: "100% combed ring-spun cotton. Oversized drop-shoulder cut. Screen-printed graphics.", price: 50, old_price: null, stock: 100, category: "tees", badge: null, color: "Cream", sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "FG Zipper", description: "Heavyweight 400gsm fleece. Drop shoulder cut. Kangaroo pocket.", price: 89, old_price: 120, stock: 100, category: "hoodies", badge: "hot", color: "Black", sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]), images: JSON.stringify([]) },
      { name: "Gods Brand Hoodie", description: "Heavyweight 400gsm fleece. Drop shoulder cut. Kangaroo pocket.", price: 95, old_price: null, stock: 100, category: "hoodies", badge: "new", color: "Grey", sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]), images: JSON.stringify([]) },
      { name: "Iced Heart Hoodie", description: "Heavyweight 400gsm fleece. Drop shoulder cut. Kangaroo pocket.", price: 89, old_price: null, stock: 100, category: "hoodies", badge: null, color: "Cream", sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]), images: JSON.stringify([]) },
      { name: "Red Dice Hoodie", description: "Heavyweight 400gsm fleece. Drop shoulder cut. Kangaroo pocket.", price: 85, old_price: null, stock: 100, category: "hoodies", badge: "new", color: "Black", sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]), images: JSON.stringify([]) },
      { name: "Valentine's Hoodie", description: "Heavyweight 400gsm fleece. Drop shoulder cut. Kangaroo pocket.", price: 92, old_price: null, stock: 100, category: "hoodies", badge: "hot", color: "Black", sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]), images: JSON.stringify([]) },
      { name: "TNF Retro Nuptse Jacket", description: "Premium insulation. Water-resistant shell. Packable design.", price: 189, old_price: null, stock: 100, category: "jackets", badge: "new", color: "Black", sizes: JSON.stringify(["S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "TNF Lhotse Jacket", description: "Premium insulation. Water-resistant shell. Packable design.", price: 169, old_price: null, stock: 100, category: "jackets", badge: null, color: "Azul", sizes: JSON.stringify(["S", "M", "L", "XL"]), images: JSON.stringify([]) },
      { name: "Air Jordan 4 Retro", description: "Premium materials. Iconic silhouette. Comfort cushioning.", price: 180, old_price: 220, stock: 100, category: "sneakers", badge: "hot", color: "OG", sizes: JSON.stringify(["39", "40", "41", "42", "43", "44", "45"]), images: JSON.stringify([]) },
      { name: "KD18 x Chet Holmgren", description: "Premium materials. Iconic silhouette. Comfort cushioning.", price: 130, old_price: 180, stock: 100, category: "sneakers", badge: "new", color: "Azul", sizes: JSON.stringify(["39", "40", "41", "42", "43", "44", "45"]), images: JSON.stringify([]) },
      { name: "Nike Air Force 1'07", description: "Premium materials. Iconic silhouette. Comfort cushioning.", price: 110, old_price: null, stock: 100, category: "sneakers", badge: null, color: "Blancas", sizes: JSON.stringify(["39", "40", "41", "42", "43", "44", "45"]), images: JSON.stringify([]) },
      { name: "Nike Air Max Moto 2k", description: "Premium materials. Iconic silhouette. Comfort cushioning.", price: 145, old_price: null, stock: 100, category: "sneakers", badge: "new", color: "Multicolor", sizes: JSON.stringify(["39", "40", "41", "42", "43", "44", "45"]), images: JSON.stringify([]) },
      { name: "Nike Air Max Plus", description: "Premium materials. Iconic silhouette. Comfort cushioning.", price: 150, old_price: null, stock: 100, category: "sneakers", badge: "hot", color: "Azul/Blanco", sizes: JSON.stringify(["39", "40", "41", "42", "43", "44", "45"]), images: JSON.stringify([]) }
    ];

    for (const p of initialProducts) {
      insertProduct.run({
        $name: p.name,
        $description: p.description,
        $price: p.price,
        $old_price: p.old_price,
        $category: p.category,
        $images: p.images,
        $sizes: p.sizes,
        $color: p.color,
        $badge: p.badge,
        $stock: p.stock,
        $is_featured: p.is_featured || 0
      });
    }
    insertProduct.free();

    saveDatabase();
    console.log('✅ Datos de ejemplo insertados');
  }

  // Crear usuario admin por defecto
  const bcrypt = require('bcryptjs');
  const adminCheck = db.exec('SELECT id FROM users WHERE email = \'admin@void.com\'');

  if (adminCheck.length === 0) {
    const hashedPassword = bcrypt.hashSync('Admin123!', 10);
    db.run(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, ['Admin VOID', 'admin@void.com', hashedPassword, 'admin']);
    saveDatabase();
    console.log('✅ Usuario admin creado: admin@void.com / Admin123!');
  }
};

// Inicializar base de datos
const initDatabase = async () => {
  await loadDatabase();
  enableForeignKeys();
  createTables();
  seedData();
  saveDatabase();
  console.log('🗄️  Base de datos inicializada:', dbPath);
};

// Helper para ejecutar queries
const runQuery = (sql, params = []) => {
  db.run(sql, params);
  saveDatabase();
  return db.getChanges();
};

// Helper para obtener un registro
const getOne = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    result = row;
  }
  stmt.free();
  return result;
};

// Helper para obtener múltiples registros
const getAll = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

// Exportar instancia y funciones
module.exports = {
  initDatabase,
  runQuery,
  getOne,
  getAll,
  saveDatabase,
  getDb: () => db
};

// Si se ejecuta directamente, inicializa la BD
if (require.main === module) {
  initDatabase();
}
