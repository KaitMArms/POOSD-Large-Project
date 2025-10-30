const express = require('express');
const router = express.Router();
const { register, login} = require('../controllers/login.controller');

// Public
router.post('/register', register);
router.post('/login', login);

module.exports = router;