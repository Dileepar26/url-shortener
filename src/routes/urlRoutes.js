const express = require('express');
const router = express.Router();
const { createShortUrl, redirectUrl } = require('../controllers/urlControllers');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/shorten', authenticateToken, createShortUrl);
router.get('/shorten/:alias', authenticateToken, redirectUrl);
// router.get('/analytics/:alias', authenticateToken, getUrlAnalytics);
// router.get('/analytics/topic/:topic', authenticateToken, getTopicAnalytics);
// router.get('/overall/analytics', getOverallAnalytics);
module.exports = router;
