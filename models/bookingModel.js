const mongoose = require('mongoose');
const { Schema } = mongoose;
const bookingSchema = new mongoose.Schema({

  user:{
        type: Schema.Types.ObjectId,
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
 details: {type: Schema.Types.Mixed,
 }
}, { timestamps: true })
bookingSchema.index({ 'details.agencyId': 1 });

const Booking = mongoose.model('Booking',bookingSchema);
module.exports = Booking;