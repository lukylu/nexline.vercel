require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');

// Importar inicialización de BD
const { initDatabase } = require('./models/database');

// Crear app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Asegurar directorio de uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas desde uploads
app.use('/uploads', express.static(uploadsDir));

// Servir imágenes desde nexline_datos (para desarrollo)
app.use('/nexline_datos', express.static(path.join(__dirname, '../../nexline_datos')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'VOID Streetwear API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Middleware de error 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Middleware de error global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
const startServer = async () => {
  // Inicializar base de datos
  await initDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     🛍️  VOID Streetwear API - Servidor      ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Uploads disponibles en http://localhost:${PORT}/uploads`);
    console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('Endpoints disponibles:');
    console.log('  POST   /api/auth/register       - Registro usuario');
    console.log('  POST   /api/auth/login          - Login usuario');
    console.log('  POST   /api/auth/login-admin    - Login admin');
    console.log('  GET    /api/products            - Listar productos');
    console.log('  POST   /api/products            - Crear producto (admin)');
    console.log('  PUT    /api/products/:id        - Editar producto (admin)');
    console.log('  DELETE /api/products/:id        - Borrar producto (admin)');
    console.log('  POST   /api/orders              - Crear pedido');
    console.log('  GET    /api/orders              - Listar pedidos (admin)');
    console.log('');
  });
};

startServer();
