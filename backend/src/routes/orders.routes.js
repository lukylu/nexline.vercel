const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');

router.post('/', ordersController.create);
router.get('/my-orders', ordersController.getMyOrders);

module.exports = router;
