const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
booking:{
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
},
user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
},
amount:{
    type:Number,
    required:true
},
paymentMethod:{
    type:String,
    required:true,
    enum:['cash','card','PayPal'],
    default: 'card'
},
status:{
    type:String,
    enum:['pending','paid','rejected'],
    default:'pending'
},
createdAt:{
    type:Date,
    default:Date.now()
},
transactionId:{
    type: String,
    required: true
}

})
const Payment = mongoose.model('Payment',paymentSchema);
module.exports = Payment;