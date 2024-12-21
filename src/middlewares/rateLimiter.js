const redisClient = require('./redis');

// Middleware to rate limit: max 5 requests per 10 seconds
const rateLimiter = (limit, windowInSeconds) => {
    return async (req, res, next) => {
        const ip = req.ip;

        try {
            const requestCount = await redisClient.incr(ip);

            if (requestCount === 1) {
                await redisClient.expire(ip, windowInSeconds);
            }

            if (requestCount > limit) {
                return res.status(429).json({
                    message: 'Too many requests. Please try again later.',
                });
            }

            next();
        } catch (err) {
            console.error('Redis error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

module.exports = rateLimiter
