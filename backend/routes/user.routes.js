const express = require('express');
const router = express.Router();
const {
  profile,
  settings,
  profileUpd,
  settingsUpd,
  deleteAccount,
  uploadAvatar,        // 🔹 add this
} = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth');
const avatarUpload = require('../middleware/avatarUpload'); // 🔹 multer config

router.use(requireAuth);

// Authenticated
router.get('/profile', profile);
router.get('/settings', settings);
router.patch('/profile', profileUpd);
router.patch('/settings', settingsUpd);
router.delete('/delete', deleteAccount);

// 🔹 NEW: avatar upload
router.post(
  '/avatar',
  avatarUpload.single('avatar'),
  uploadAvatar
);

module.exports = router;
