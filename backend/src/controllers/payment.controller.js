const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');

const createIntent = async (req, res) => {
  try {
    const { items, shipping } = req.body;
    
    // Calcular total real desde DB
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (product) total += product.price * item.quantity;
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      metadata: { items: JSON.stringify(items.map(i => i.id)) },
      shipping: {
        name: shipping.name,
        address: {
          line1: shipping.address,
          city: shipping.city,
          postal_code: shipping.zip,
          country: 'ES'
        }
      }
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createIntent };
