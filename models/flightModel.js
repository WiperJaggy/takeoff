const mongoose = require('mongoose');
const validator = require('validator');

const flightSchema = new mongoose.Schema({
    agencyId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Agency',
        required: true
    },
    flightNumber:{
        type: String,
        required: true,
        unique:true
    },
    title:{
        type: String,
        required: true
    },
    oneWay:{
        type: Boolean,
        default: true
    },
    takeoffCity:{
        type:String,
        required: true
    },
    takeoffAirport:{
        type: String,
        required: true
    },
    landingCity:{
        type: String,
        required: true
    },
    landingAirport:{
        type: String,
        required: true
    },
    departureDate:{
        type: Date,
        required: true
    },
    eat:{
        type: Date,
    },
    airlines:{
        type: String,
        required: true
    },
    returnDate:{
        type: Date,
    },
    availabilty:{
        type: Boolean,
        default: true
    },
    availableSeats:{
        type: Number,
        required: true
    },
    transit:{
        type: Boolean,
        required: true,
        default:false
    },
    transitInfo:[
        {
            city: {
              type: String,
            },
            duration: {
              type: Number,
            }

    }],
    price:{
        type: Number,
        required: true
    },
    priceDiscount:{
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    ceratedAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
flightSchema.virtual('agency', {
    ref: 'Agency',
    localField: 'agency',
    foreignField: '_id',
    justOne: true
  });
  flightSchema.pre('validate', function(next) {
    if (this.transit && this.transitInfo.length === 0) {
      this.invalidate('transitInfo', 'Transit information is required when transit is true');
    }
    next();
  });
const Flight = mongoose.model('Flight',flightSchema);
module.exports = Flight;