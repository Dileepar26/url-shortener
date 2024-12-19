const express = require('express');
const { googleRedirect, googleLogin } = require('../controllers/auth');
const router = express.Router();

// Google authentication route
router.get('/google', googleLogin);

// Google callback route
router.get('/google/callback', googleRedirect);

module.exports = router;
