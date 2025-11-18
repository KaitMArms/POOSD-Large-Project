const express = require('express');
const router = express.Router();
const {viewUserGames, searchUserGames, deleteUserGame, editGameInfo, addUserGame, likeGame} = require('../controllers/userGames.controller');
// commented out getting viewUserGameById from userGames controller
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', viewUserGames);
router.post('/add', addUserGame);
router.post('/:gameId/like', likeGame);
router.get('/search', searchUserGames);
// router.get('/:gameId', viewUserGameById);
router.delete('/:gameId', deleteUserGame);
router.patch('/:gameId', editGameInfo);

module.exports = router;