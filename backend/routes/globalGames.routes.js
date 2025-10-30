const express = require('express');
const router = express.Router();
const {searchGames, recommendedGames, addUserGame} = require('../controllers/globalGames.controller');

router.use(requireAuth);

router.get('/search', searchGames);
router.get('/recommended', recommendedGames);
router.post('/add', addUserGame);

module.exports = router;