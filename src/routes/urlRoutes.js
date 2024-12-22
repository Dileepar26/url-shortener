const express = require('express');
const router = express.Router();
const { createShortUrl, redirectUrl } = require('../controllers/urlControllers');
const { authenticateToken } = require('../middlewares/authenticateToken');
const { getUrlAnalytics, getTopicAnalytics, getOverallAnalytics } = require('../controllers/analytics');
const rateLimiter = require('../middlewares/rateLimiter');

router.post('/shorten', rateLimiter(10, 10), createShortUrl);
router.get('/shorten/:alias', redirectUrl);
router.get('/analytics/:alias', getUrlAnalytics);
router.get('/analytics/topic/:topic', getTopicAnalytics);
router.get('/overall/analytics', authenticateToken, getOverallAnalytics);
module.exports = router;
