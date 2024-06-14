const mongoose = require('mongoose');
const Agency = require('./../models/agencyModel');
const Service = require('./../models/serviceModel');

const agencyServicesSchema = new mongoose.Schema({

agencyId:{
    type: mongoose.Schema.ObjectId,
    ref: 'Agency',
    required: true
},
serviceId:{
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
},
licenseExpiryDatte:{
    type: Date,
    required: true,
    default: Date.now()
},
addedAt:{
    type: Date,
    default: Date.now()
}
})
const AgencyServices = mongoose.model('AgencyServices',agencyServicesSchema);
module.exports = AgencyServices;