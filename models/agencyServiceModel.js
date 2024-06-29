const mongoose = require('mongoose');
const Agency = require('./../models/agencyModel');
const Service = require('./../models/serviceModel');

const agencyServiceSchema = new mongoose.Schema({

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
description:{
type:String,
},
discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  price: {
    type: Number,
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

agencyServiceSchema.virtual('priceAfterDiscount').get(function() {
  return this.price * (1 - (this.discountPercentage / 100));
});
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