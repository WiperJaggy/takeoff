const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
    {
        method: { type: String, required: true },
        url: { type: String, required: true },
        ip: { type: String },
        useragent: { type: String },
        requestBody: { type: mongoose.Schema.Types.Mixed },
        headers: { type: mongoose.Schema.Types.Mixed },
        statusCode: { type: Number },
        responseBody: { type: String },
        timestamp: { type: Date, default: Date.now }, 
    },
);

module.exports = mongoose.model('Request', requestSchema);
