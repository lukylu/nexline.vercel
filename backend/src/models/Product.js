const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  old_price: Number,
  category: String,
  images: [String],
  sizes: [String],
  color: String,
  badge: String,
  stock: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false },
  is_new: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
