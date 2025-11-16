const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {searchGames, recommendedGames, addUserGame, browseGames, browseRecommended, getGameById} = require('../controllers/globalGames.controller');

router.use(requireAuth);

router.get('/browse', browseGames);
router.get('/search', searchGames);
router.get('/recommended', recommendedGames);
router.post('/add', addUserGame);
router.get('/browse/recommended', browseRecommended);
router.get('/:id', getGameById);

module.exports = router;