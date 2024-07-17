// const mongoose = require('mongoose');
// const bookingSchema = new mongoose.Schema({
//  user:{
//     type: mongoose.Schema.ObjectId,
//     ref:'User',
//     required:[true,'A booking must belong to a user']
//  },
//  bookingType:{
//     type: String,
//     required: true,
//     enum:['trip','car','scholarship','flight'],
//  }, 
//  totalPrice:{
//       type:Number,
//       required:[true, "A booking must have a total price"]
//  },
//  service:{
//     type: mongoose.Schema.ObjectId,
//     ref:'AgencyService',
//  },
//   status: { type: String,
//     enum: [,'pending payment' ,'confirmed', 'cancelled'],
//     default: 'pending payment' 
//  },
//  creatdAt:{
//     type:Date,
//     default:Date.now()
//  },
//  updatedAt:{
//     type:Date
//  }
// })

// bookingSchema.pre('save', function(next) {
//    // Set the additional fields based on the bookingType
//    switch (this.bookingType) {
//      case 'car':
//        Object.assign(this, {
//          licenceId: this.licenceId,
//          licenceType: this.licenceType,
//          bloodType: this.bloodType,
//          startDate: this.startDate,
//          endDate: this.endDate,
//        });
//        break;
//      case 'flight':
//        Object.assign(this, {
//          flightNumber: this.flightNumber,
//          seatNumber: this.seatNumber,
//        });
//        break;
//      // Add more cases for other booking types
//    }
 
//    // Update the updatedAt field on every save
//    this.updatedAt = Date.now();
//    next();
//  });


// bookingSchema.pre(/^find/, function(next) {
//    this.populate('service','serviceType');
//    next();
//  });
// const Booking = mongoose.model('Booking', bookingSchema);
// module.exports = Booking



const mongoose = require('mongoose');
const { Schema } = mongoose;
const bookingSchema = new mongoose.Schema({

  user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'A booking must belong to a user']
     },
 bookingType:{
    type: String,
    required: true,
    enum:['trip','car','scholarship','flight'],
 }, 
 serviceId: {
  type: Schema.Types.ObjectId,
  required: true
},
 totalPrice:{
   type:Number,
   required:[true, "A booking must have a total price"]
 },
  status: { type: String,
    enum: [,'pending payment' ,'confirmed', 'cancelled','returned'],
    default: 'pending payment' 
 },
  creatdAt:{
    type:Date,
    default:Date.now()
 },
 updatedAt:{
    type:Date
 },
 details: Schema.Types.Mixed
}, { timestamps: true })
const Booking = mongoose.model('Booking',bookingSchema);
module.exports = Booking;