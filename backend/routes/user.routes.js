const express = require('express');
const router = express.Router();
const {profile, settings, profileUpd, settingsUpd} = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth');

// Authenticated
router.get('/profile', requireAuth, profile);
router.get('/settings', requireAuth, settings);
router.patch('/profile', requireAuth, profileUpd);
router.patch('/settings', requireAuth, settingsUpd);

module.exports = router;