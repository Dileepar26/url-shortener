const { Database } = require('../utils/database');
const logger = require('../utils/logger');
const { validateGetUrlAnalytics, validateGetTopicAnalytics } = require('../validators/analytics');

const getUrlAnalytics = async (req, res) => {
  try {
    const clientError = validateGetUrlAnalytics(req.params);
    if (clientError) {
      logger.warn(clientError);
      return res.status(400).json({
        success: false,
        message: clientError
      })
    }
    const { alias } = req.params;
    const DB = new Database();

    const urlRows = await DB.query(
      `SELECT * FROM urls WHERE shortUrl = ?`,
      [alias]
    );
    if (urlRows.length === 0) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    const analyticsRows = await DB.query(
      `SELECT  id, shortUrl, user_id, userAgent, ipAddress, country, city, osType, deviceType, DATE(timestamp) AS date
          FROM url_analytics
          WHERE shortUrl = ?
          ORDER BY date DESC
          LIMIT 7`,
      [alias]
    );

    // Initialize variables for calculations
    let totalClicks = 0;
    const uniqueIPs = new Set();
    const clicksByDate = [];
    const osTypeData = {};
    const deviceTypeData = {};

    // Process the analytics rows
    analyticsRows.forEach((row) => {
      totalClicks++;
      // Track unique clicks by IP
      uniqueIPs.add(row.user_id);
      // Group clicks by date
      const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
      const existingDate = clicksByDate.find((entry) => entry.date === date);
      if (existingDate) {
        existingDate.clicks++;
      } else {
        clicksByDate.push({ date, clicks: 1 });
      }
      // Aggregate OS Type
      const osName = row.osType || 'Unknown';
      if (!osTypeData[osName]) {
        osTypeData[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      osTypeData[osName].uniqueClicks++;
      osTypeData[osName].uniqueUsers.add(row.user_id); // we can do unique use by user_id also

      // Aggregate Device Type
      const deviceName = row.deviceType || 'Unknown';
      if (!deviceTypeData[deviceName]) {
        deviceTypeData[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      deviceTypeData[deviceName].uniqueClicks++;
      deviceTypeData[deviceName].uniqueUsers.add(row.user_id);
    });

    // Format osType and deviceType data
    const osType = Object.entries(osTypeData).map(([osName, data]) => ({
      osName,
      uniqueClicks: data.uniqueClicks,
      uniqueUsers: data.uniqueUsers.size,
    }));

    const deviceType = Object.entries(deviceTypeData).map(([deviceName, data]) => ({
      deviceName,
      uniqueClicks: data.uniqueClicks,
      uniqueUsers: data.uniqueUsers.size,
    }));

    // Respond with analytics data
    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueIPs.size,
      clicksByDate,
      osType,
      deviceType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopicAnalytics = async (req, res) => {
  try {
    const clientError = validateGetTopicAnalytics(req.params);
    if (clientError) {
      logger.warn(clientError);
      return res.status(400).json({
        success: false,
        message: clientError
      })
    }
    const { topic } = req.params;
    const DB = new Database();
    const analyticsRows = await DB.query(
      `SELECT  u.shortUrl, ua.user_id, DATE(ua.timestamp) AS date
        FROM urls u
        LEFT JOIN url_analytics ua ON u.shortUrl = ua.shortUrl
        WHERE u.topic = ?
        ORDER BY date DESC`,
      [topic]
    );

    let totalClicks = 0;
    const uniqueIPs = new Set();
    const clicksByDate = [];
    const urlsData = {};

    analyticsRows.forEach((row) => {
      totalClicks++; //total clicks
      if (row.user_id) uniqueIPs.add(row.user_id); // total unique ips
      const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
      const existingDate = clicksByDate.find((entry) => entry.date === date);
      if (existingDate) {
        existingDate.clicks++;
      } else {
        clicksByDate.push({ date, clicks: 1 });
      }
      if (!urlsData[row.shortUrl]) {
        urlsData[row.shortUrl] = {
          shortUrl: row.shortUrl,
          totalClicks: 0,
          uniqueClicks: new Set(),
        };
      }
      urlsData[row.shortUrl].totalClicks++;
      if (row.ipAddress) urlsData[row.shortUrl].uniqueClicks.add(row.ipAddress);
    });

    // Format URL data
    const urls = Object.values(urlsData).map((url) => ({
      shortUrl: url.shortUrl,
      totalClicks: url.totalClicks,
      uniqueClicks: url.uniqueClicks.size,
    }));

    // Respond with analytics data
    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueIPs.size,
      clicksByDate,
      urls,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getOverallAnalytics = async (req, res) => {
};

module.exports = {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics
};
