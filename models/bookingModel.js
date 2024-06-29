const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
 user:{
    type: mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'A booking must belong to a user']
 },
 service:{
    type: mongoose.Schema.ObjectId,
    ref:'AgencyService',
    required:[true,'A booking must belong to a service']
 },
 quantity:{
   type: Number,
   default :1,
 },
 totalPrice: {
   type: Number,
   required: [true, 'A booking must have a price']
 },
  status: { type: String,
    enum: [,'pending payment' ,'confirmed', 'cancelled'],
    default: 'pending payment' 
 },
 numPeople: { type: Number,
    min: 1
    },
 people: [
   {
     firstName: { type: String, required: true },
     lastName: { type: String, required: true },
     identifier: { type: String, required: true },
     age:{type: Number , required : true}
   }
 ],
 creatdAt:{
    type:Date,
    default:Date.now()
 },
 updatedAt:{
    type:Date
 }
})
bookingSchema.pre(/^find/, function(next) {
   this.populate('service','serviceType');
   next();
 });
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking