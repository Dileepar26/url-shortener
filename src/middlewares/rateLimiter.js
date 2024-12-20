const rateLimits = new Map(); 
const rateLimiter = (req, res, next) => {
    const maxRequests = 10; // Maximum allowed requests
    const windowMs = 10 * 1000; // Time window in milliseconds (10 seconds)
    const blockDuration = 10 * 60 * 1000; // Block duration in milliseconds (10 minutes)

    // Identify the user by IP
    const identifier = `ip:${req.ip}`;

    const currentTime = Date.now();
    let requestLog = rateLimits.get(identifier);

    if (!requestLog) {
        // Initialize log for the IP
        requestLog = { requests: [], blockedUntil: null };
        rateLimits.set(identifier, requestLog);
    }

    if (requestLog.blockedUntil && currentTime < requestLog.blockedUntil) {
        // IP is blocked
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again after 10 minutes.",
        });
    }

    // Filter requests within the time window
    requestLog.requests = requestLog.requests.filter(
        (timestamp) => currentTime - timestamp < windowMs
    );

    // Add the current request timestamp
    requestLog.requests.push(currentTime);

    if (requestLog.requests.length > maxRequests) {
        // Block the IP
        requestLog.blockedUntil = currentTime + blockDuration;
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again after 10 minutes.",
        });
    }

    // Allow the request
    next();
};

module.exports = rateLimiter;
