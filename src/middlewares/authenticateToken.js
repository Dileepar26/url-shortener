const jwt = require('jsonwebtoken');
const { Database } = require('../utils/database'); // Assuming you have a DB utility
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
        if (!token) {
            return res.status(401).json({ message: 'Access Denied: No Token Provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const DB = new Database();
        const user = await DB.query(`SELECT * FROM users WHERE id = ?;`, [decoded.id]);
        if (user.length === 0) {
            return res.status(403).json({ message: 'Access Denied: Invalid User' });
        }
        req.user = user[0];
        next();
    } catch (error) {
        logger.error(error.stack)
        return res.status(403).json({ message: 'Access Denied: Invalid Token or Database Error', error: error.message });
    }
};

const authTokenWithoutMiddleware = async(token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const DB = new Database();
        const user = await DB.query(`SELECT * FROM users WHERE id = ?;`, [decoded.id]);
        if (user.length === 0) {
            return null
        }
        return user[0];
    } catch (error) {
        logger.error(error.stack)
    }
  }

module.exports = {
    authenticateToken,
    authTokenWithoutMiddleware
};
