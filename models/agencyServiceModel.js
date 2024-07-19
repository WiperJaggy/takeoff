const mongoose = require('mongoose');
const Agency = require('./../models/agencyModel');
const Service = require('./../models/serviceModel');

const agencyServiceSchema = new mongoose.Schema({

agencyId:{
    type: mongoose.Types.ObjectId,
    ref: 'Agency',
    required: true
},
serviceId:{
    type: mongoose.Types.ObjectId,
    ref: 'Service',
    required: true
},
description:{
type:String,
},
licenseExpiryDate:{
    type: Date,
    required: true,
    default: Date.now()
},
addedAt:{
    type: Date,
    default: Date.now()
},
available:{
    type:Boolean,
    default:true
},
updatedAt:{ 
    type: Date
}
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

agencyServiceSchema.pre(/^find/, function(next) {
  this.populate('agencyId','name');
  next();
});
agencyServiceSchema.pre(/^find/, function(next) {
  this.populate('serviceId','serviceType');
  next();
});

const AgencyService = mongoose.model('AgencyService',agencyServiceSchema);
module.exports = AgencyService;