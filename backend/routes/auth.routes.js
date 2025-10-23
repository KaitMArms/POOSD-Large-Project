// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, me, changePassword, updateProfile } = require('../controllers/auth.controller');
const requireAuth = require('../middleware/requireAuth');

// Public
router.post('/register', register);
router.post('/login', login);

// Authenticated
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePassword);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;