const express = require('express');
const router = express.Router();
const {profile, settings, profileUpd, settingsUpd, deleteAccount} = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// Authenticated
router.get('/profile', profile);
router.get('/settings', settings);
router.patch('/profile', profileUpd);
router.patch('/settings', settingsUpd);
router.delete('/delete', deleteAccount);

module.exports = router;