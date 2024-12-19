const { Database } = require('../utils/database');
const logger = require('../utils/logger');

const getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const DB = new Database();
    console.log(alias, 'al')

    // Validate if the URL exists
    const urlRows = await DB.query(
      `SELECT * FROM urls WHERE shortUrl = ? OR customAlias = ?`,
      [alias, alias]
    );

    if (urlRows.length === 0) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Fetch analytics data for the given short URL
    const analyticsRows = await DB.query(
      `SELECT  id, shortUrl,  userAgent, ipAddress, country, city, osType, deviceType, DATE(timestamp) AS date
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
      uniqueIPs.add(row.ipAddress);
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
      osTypeData[osName].uniqueUsers.add(row.ipAddress);

      // Aggregate Device Type
      const deviceName = row.deviceType || 'Unknown';
      if (!deviceTypeData[deviceName]) {
        deviceTypeData[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      deviceTypeData[deviceName].uniqueClicks++;
      deviceTypeData[deviceName].uniqueUsers.add(row.ipAddress);
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
    const { topic } = req.params;
    const DB = new Database();

    // Validate if the topic exists
    const topicRows = await DB.query(
      `SELECT COUNT(*) AS count FROM urls WHERE topic = ?`,
      [topic]
    );

    if (topicRows[0].count === 0) {
      return res.status(404).json({ message: 'No URLs found for the specified topic' });
    }

    // Fetch raw analytics data
    const analyticsRows = await DB.query(
      `SELECT 
              u.shortUrl,
              ua.ipAddress,
              DATE(ua.timestamp) AS date
           FROM 
              urls u
           LEFT JOIN 
              url_analytics ua 
           ON 
              u.shortUrl = ua.shortUrl
           WHERE 
              u.topic = ?
           ORDER BY 
              date DESC`,
      [topic]
    );

    // Initialize variables for calculations
    let totalClicks = 0;
    const uniqueIPs = new Set();
    const clicksByDate = [];
    const urlsData = {};

    // Process the analytics rows
    analyticsRows.forEach((row) => {
      totalClicks++;

      // Track unique clicks by IP
      if (row.ipAddress) uniqueIPs.add(row.ipAddress);

      // Group clicks by date
      const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
      const existingDate = clicksByDate.find((entry) => entry.date === date);
      if (existingDate) {
        existingDate.clicks++;
      } else {
        clicksByDate.push({ date, clicks: 1 });
      }

      // Aggregate data for each URL
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
  try {
      const userId = 0 // Assuming authenticated user's ID is in `req.user`

      const DB = new Database();

      // Fetch raw analytics data for all user's URLs
      const analyticsRows = await DB.query(
          `SELECT 
              u.shortUrl,
              ua.ipAddress,
              ua.osType,
              ua.deviceType,
              DATE(ua.timestamp) AS date
           FROM 
              urls u
           LEFT JOIN 
              url_analytics ua 
           ON 
              u.shortUrl = ua.shortUrl
           WHERE 
              u.user_id = 0
           ORDER BY 
              date DESC`,
          [userId]
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
          if (row.ipAddress) uniqueIPs.add(row.ipAddress);

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
          osTypeData[osName].uniqueUsers.add(row.ipAddress);

          // Aggregate Device Type
          const deviceName = row.deviceType || 'Unknown';
          if (!deviceTypeData[deviceName]) {
              deviceTypeData[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
          }
          deviceTypeData[deviceName].uniqueClicks++;
          deviceTypeData[deviceName].uniqueUsers.add(row.ipAddress);
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

      // Respond with overall analytics data
      res.status(200).json({
          totalUrls: 0,
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

module.exports = {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics
};
