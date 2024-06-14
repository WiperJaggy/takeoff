const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
 user:{
    type: mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'A booking must belong to a user']
 },
 service:{
    type: mongoose.Schema.ObjectId,
    ref:'Service',
    required:[true,'A booking must belong to a service']
 },
 totalPrice:{
    type:Number,
    required:[true,'A booking must have a price']
 },
 creatdAt:{
    type:Date,
    default:Date.now()
 },
 updatedAt:{
    type:Date
 }
})
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking