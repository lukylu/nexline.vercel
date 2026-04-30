const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAll,
  getByCategory,
  getById,
  create,
  update,
  remove,
  uploadImage
} = require('../controllers/products.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// Configuración de multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, avif)'));
    }
  }
});

// GET /api/products - Obtener todos los productos
router.get('/', getAll);

// GET /api/products/category/:category - Productos por categoría
router.get('/category/:category', getByCategory);

// GET /api/products/:id - Producto por ID
router.get('/:id', getById);

// POST /api/products - Crear producto (admin)
router.post('/', verifyToken, requireAdmin, create);

// PUT /api/products/:id - Actualizar producto (admin)
router.put('/:id', verifyToken, requireAdmin, update);

// DELETE /api/products/:id - Eliminar producto (admin)
router.delete('/:id', verifyToken, requireAdmin, remove);

// POST /api/products/upload - Subir imagen (admin)
router.post('/upload', verifyToken, requireAdmin, upload.single('image'), uploadImage);

module.exports = router;
