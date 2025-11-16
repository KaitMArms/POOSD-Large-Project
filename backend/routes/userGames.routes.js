const express = require('express');
const router = express.Router();
const {addUserGame, viewUserGames, searchUserGames, deleteUserGame, editGameInfo} = require('../controllers/userGames.controller');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/add', addUserGame);
router.get('/', viewUserGames);
router.get('/search', searchUserGames);
router.delete('/:gameId', deleteUserGame);
router.patch('/:gameId', editGameInfo);

module.exports = router;