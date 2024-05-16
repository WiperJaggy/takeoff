const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
    {
        method: { type: String, required: true },
        url: { type: String, required: true },
        ip: { type: String },
        useragent: { type: String },
        body: { type: Object },
        timestamp: { type: Date, default: Date.now },
    },
);

module.exports = mongoose.model('Request', requestSchema);
