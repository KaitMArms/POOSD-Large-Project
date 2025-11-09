const express = require('express');
const router = express.Router();
const {addGame, editGame, deleteGame, viewGames, search} = require('../controllers/dev.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

// Authenticated & Role 'dev'
router.use(requireAuth);
router.use(requireRole('dev')); //requires auth first

router.get('/games/view', viewGames);
router.post('/games/add', addGame);
router.patch('/games/:id', editGame);
router.delete('/games/:id', deleteGame);
router.get('/games/search', search); 

module.exports = router;