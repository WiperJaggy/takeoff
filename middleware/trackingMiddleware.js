const requestIp = require('request-ip');
const Request = require('../models/requests');

const trackingMiddleware = async (req, res, next) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        const request = new Request({
            method: req.method,
            url: req.originalUrl,
            ip: clientIp,
            useragent: req.headers['user-agent'],
            body: req.body,
        });
        await request.save();
        next();
    } catch (error) {
        console.error('Error tracking request:', error);
        next(error);
    }
};

module.exports = trackingMiddleware;
