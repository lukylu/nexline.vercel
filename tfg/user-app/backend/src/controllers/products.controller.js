const ProductModel = require('../models/product.model');
const path = require('path');
const fs = require('fs');

/**
 * Obtener todos los productos
 * GET /api/products
 */
const getAll = (req, res) => {
  try {
    const products = ProductModel.findAll();

    // Parsear imágenes y tallas de JSON
    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      sizes: p.sizes ? JSON.parse(p.sizes) : []
    }));

    res.json({ products: parsedProducts });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Obtener productos por categoría
 * GET /api/products/category/:category
 */
const getByCategory = (req, res) => {
  try {
    const { category } = req.params;
    const products = ProductModel.findByCategory(category);

    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      sizes: p.sizes ? JSON.parse(p.sizes) : []
    }));

    res.json({ products: parsedProducts });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Obtener producto por ID
 * GET /api/products/:id
 */
const getById = (req, res) => {
  try {
    const { id } = req.params;
    const product = ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      product: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        sizes: product.sizes ? JSON.parse(product.sizes) : []
      }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

/**
 * Crear producto (admin)
 * POST /api/products
 */
const create = (req, res) => {
  try {
    const { name, description, price, category, images, sizes, stock, is_featured } = req.body;

    // Validaciones
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const product = ProductModel.create(
      name,
      description || '',
      parseFloat(price),
      category,
      JSON.stringify(images || []),
      JSON.stringify(sizes || []),
      parseInt(stock) || 0,
      is_featured || false
    );

    res.status(201).json({
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

/**
 * Actualizar producto (admin)
 * PUT /api/products/:id
 */
const update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, sizes, stock, is_featured } = req.body;

    // Verificar que existe
    const existing = ProductModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    ProductModel.update(
      id,
      name || existing.name,
      description !== undefined ? description : existing.description,
      price !== undefined ? parseFloat(price) : existing.price,
      category || existing.category,
      JSON.stringify(images || JSON.parse(existing.images)),
      JSON.stringify(sizes || JSON.parse(existing.sizes)),
      stock !== undefined ? parseInt(stock) : existing.stock,
      is_featured !== undefined ? is_featured : existing.is_featured
    );

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

/**
 * Eliminar producto (admin)
 * DELETE /api/products/:id
 */
const remove = (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const existing = ProductModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    ProductModel.delete(id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

/**
 * Subir imagen de producto
 * POST /api/products/upload
 */
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Imagen subida correctamente',
      url: imageUrl
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
};

module.exports = {
  getAll,
  getByCategory,
  getById,
  create,
  update,
  remove,
  uploadImage
};
