const express = require('express');
const router = express.Router();
const {
  profile,
  settings,
  profileUpd,
  settingsUpd,
  deleteAccount,
  uploadAvatar, 
} = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth');
const avatarUpload = require('../middleware/avatarUpload');

router.use(requireAuth);

// Authenticated
router.get('/profile', profile);
router.get('/settings', settings);
router.patch('/profile', profileUpd);
router.patch('/settings', settingsUpd);
router.delete('/delete', deleteAccount);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
