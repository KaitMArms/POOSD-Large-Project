const express = require('express');
const router = express.Router();
const {profile, settings, profileUpd, settingsUpd, deleteAccount, avatarUpload} = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .png, .jpg, etc.
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

router.use(requireAuth);

// Authenticated
router.get('/profile', profile);
router.get('/settings', settings);
router.patch('/profile', profileUpd);
router.patch('/settings', settingsUpd);
router.delete('/delete', deleteAccount);
router.post('/avatar', upload.single('avatar'), avatarUpload);


module.exports = router;