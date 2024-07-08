const mongoose = require('mongoose');
const Car = require('./../models/carModel');
const carBookingSchema = new mongoose.Schema({
    car:{
        type: mongoose.Schema.ObjectId,
        ref:'Car', 
     },
     user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
     },
     drivingLicenceId:{
        type: String,
        unique: [true, 'This identifier is already in use.'],
        required: [true, 'Please provide your identifier.'],
        validate: {
            validator: function(value) {
                return /^\d{6}$/.test(value);
            },
            message: 'licenceID must be 6 digits long.'
        }
    },
    drivingLicenceType: {
        type: String,
        required: true,
        enum: ['private', 'public']
      },
      bloodType: {
        type: String,
        required: true,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
      },
      startDate:{
        type: Date,
        required: [true, 'Please provide a start date.'],
        validate: {
            validator: function(value) {
                return value.getTime() > Date.now();
            },
            message: 'Start date must be in the future.'
        }
      },
      endDate: {
        type: Date,
        required: [true, 'Please provide an end date.'],
        validate: {
          validator: function(value) {
            return value.getTime() > this.startDate.getTime() && value.getTime() > Date.now();
          },
          message: 'End date must be greater than the start date and in the future.'
        }
      },
      status:{
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default:'pending'
      },
      rentingPrice: {
        type: Number,
        get: function() {
          const diffInDays = this.getDaysBetween(this.startDate, this.endDate);
          return this.car.price * (1 - this.car.priceDiscount / 100) * diffInDays;
        }
      },
      createdAt:{
        type: Date,
        default: Date.now(),
      },
      updatedAt:{
        type: Date,
      },
      activeBookings: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'carBooking'
        }
      ]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true
})
carBookingSchema.index({ car: 1, startDate: 1, endDate: 1 }, { unique: true });
carBookingSchema.pre(/^find/, function(next) {
    this.populate('user', 'userName email');
    this.populate('car');
    next();
  });
  
// Middleware to calculate the total price

  carBookingSchema.methods.getDaysBetween = function(start, end) {
    const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
    const diffDays = Math.round(Math.abs((start - end) / oneDay));
    return diffDays + 1; // Add 1 to include the last day
  };
  carBookingSchema.pre('save', async function(next) {
    // Check if this is a new booking
    if (this.isNew) {
      // Find the associated car
      const car = await Car.findById(this.car);
  
      // Update the car's available status to false
      car.available = false;
      await car.save();
    }
    next();
  });
  
  carBookingSchema.post('save', async function(doc, next) {
    // Find the associated car
    const car = await Car.findById(doc.car);
  
    // Check if there are any other active bookings for the same car
    const activeBookings = await carBooking.find({
      car: doc.car,
      startDate: { $lte: doc.endDate },
      endDate: { $gte: doc.startDate },
      _id: { $ne: doc._id }
    });
  
    // If there are no other active bookings, update the car's available status to true
    if (activeBookings.length === 0) {
      car.available = true;
      await car.save();
    }
    next();
  });

// Add a pre-save middleware to validate the user's active bookings
carBookingSchema.pre('save', async function(next) {
    const user = this.user;
  
    // Check if the user has any active bookings
    const activeBookings = await this.model('carBooking')
      .find({ user, endDate: { $gte: this.startDate } })
      .select('_id');
  
    if (activeBookings.length > 0) {
      // The user has at least one active booking, so don't allow a new booking
      const error = new Error('You already have an active car booking. You cannot make another booking at this time.');
      error.statusCode = 400;
      return next(error);
    }
  
    // Update the user's active bookings
    this.activeBookings = activeBookings.map(booking => booking._id);
  
    next();
  });
const carBooking = mongoose.model('carBooking', carBookingSchema);
module.exports = carBooking