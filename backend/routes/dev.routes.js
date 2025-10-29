const express = require('express');
const router = express.Router();
const {addGame, editGame, deleteGame, viewGames} = require('../controllers/dev.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);

// Authenticated
router.get('/')

module.exports = router;