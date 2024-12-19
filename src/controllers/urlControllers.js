const { Database } = require('../utils/database');
const shortid = require('shortid');
const geoip = require('geoip-lite');
const { validateCreateShortUrl } = require('../validators/urlControllers');
const logger = require('../utils/logger');
const useragent = require('useragent'); // Parse User-Agent header

const createShortUrl = async (req, res) => {
  try {
    const clientError = validateCreateShortUrl(req.body);
    if (clientError) {
      logger.warn(clientError);
      return res.status(400).json({
        success: false,
        message: clientError
      })
    }
    const { longUrl, customAlias, topic } = req.body;
    const shortUrl = customAlias || shortid.generate();
    const userId = req.user.id;
    const DB = new Database()
    const query = await DB.query(
      'INSERT INTO urls (longUrl, shortUrl, customAlias, topic, user_id) VALUES (?, ?, ?, ?, ?)',
      [longUrl, shortUrl, customAlias, topic, userId],
    );
    res.status(201).json({
      success:true,
      message: "data created successfully",
      shortUrl, 
      createdAt: new Date()
     });
  } catch (error) {
    logger.error(error.stack)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false,
        message: 'Custom alias already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: error.message
      });
    }
  }
};


const redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    const DB = new Database();
    console.log(alias)
    // Fetch the original URL
    const rows = await DB.query(
      `SELECT longUrl FROM urls WHERE shortUrl = ? OR customAlias = ?`,
      [alias, alias]
    );

    if (rows.length === 0) {
      return res.status(404).send('URL not found');
    }

    const longUrl = rows[0].longUrl;

    // Increment total clicks
    await DB.query(
      `UPDATE urls SET clicks = clicks + 1 WHERE shortUrl = ? OR customAlias = ?`,
      [alias, alias]
    );
    const user_id = req.user.id
    const userAgentHeader = req.headers['user-agent'] || 'Unknown';
    const userAgent = useragent.parse(userAgentHeader);
    const deviceType = userAgent.device.family === 'Other' ? 'Desktop' : 'Mobile';
    const osType = userAgent.os.family;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    let country = 'Localhost';
    let city = 'Local';
    if (ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      const geo = geoip.lookup(ipAddress);
      country = geo?.country || 'Unknown';
      city = geo?.city || 'Unknown';
    }
    // Log the analytics data
    await DB.query(
      `INSERT INTO url_analytics (shortUrl, userAgent, ipAddress, osType, deviceType, country, city, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [alias, userAgentHeader, ipAddress, osType, deviceType, country, city, user_id]
    );
    // Redirect the user
    res.redirect(longUrl);
  } catch (error) {
    logger.error(error.stack)
    res.status(500).json({ error: error });
  }
};

module.exports = {
  createShortUrl,
  redirectUrl
};
