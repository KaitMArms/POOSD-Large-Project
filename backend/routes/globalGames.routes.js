const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {searchGames, recommendedGames, addUserGame} = require('../controllers/globalGames.controller');

router.use(requireAuth);

router.get('/search', searchGames);
router.get('/recommended', recommendedGames);
router.post('/add', addUserGame);

module.exports = router;