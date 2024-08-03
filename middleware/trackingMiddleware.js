const requestIp = require('request-ip');
const Request = require('../models/requests');

const trackingMiddleware = async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);

    let responseBody;
    const originalWrite = res.write;
    const originalEnd = res.end;
    const chunks = [];

    res.write = function (chunk) {
        chunks.push(chunk);
        originalWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) {
            chunks.push(chunk);
        }
        responseBody = Buffer.concat(chunks).toString('utf8');
        originalEnd.apply(res, arguments);
    };

    res.on('finish', async () => {
        try {
            const request = new Request({
                method: req.method,
                url: req.originalUrl,
                ip: clientIp,
                useragent: req.headers['user-agent'],
                requestBody: req.body,
                headers: req.headers,
                statusCode: res.statusCode,
                responseBody: responseBody,
            });

            await request.save();
        } catch (error) {
            console.error('Error saving request to database:', error.message);
        }
    });

    next();
};

module.exports = trackingMiddleware;
