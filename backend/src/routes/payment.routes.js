const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create-intent', paymentController.createIntent);

module.exports = router;
