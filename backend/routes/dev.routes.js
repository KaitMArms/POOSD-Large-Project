const express = require('express');
const router = express.Router();
const {
  addGame,
  editGame,
  deleteGame,
  viewGames,
  search,
  uploadCover,
} = require('../controllers/dev.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const gameCoverUpload = require('../middleware/gameCoverUpload');

router.use(requireAuth);
router.use(requireRole('dev'));

router.post(
  '/games/cover',
  gameCoverUpload.single('cover'),
  uploadCover
);

router.get('/games/view', viewGames);
router.post('/games/add', addGame);
router.patch('/games/:id', editGame);
router.delete('/games/:id', deleteGame);
router.get('/games/search', search);

module.exports = router;
