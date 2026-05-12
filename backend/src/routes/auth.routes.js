const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login-admin', authController.loginAdmin);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
