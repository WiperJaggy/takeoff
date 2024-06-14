const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
rating :{
  type: Number,
  min:1,
  max:5
},
trip:{
    type: mongoose.Schema.ObjectId,
    ref: 'Trip'
},
user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required : [true, "A review must belong to a user"]
},
service:{
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
},
agency:{
    type: mongoose.Schema.ObjectId,
    ref: 'Agency'
},
comment:{
    type: String,
    required : [true, "A review must have a comment"]
},
createdAt:{
    type: Date,
    default: Date.now()
},
updatedAt:{
    type:Date
}
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.pre(/^find/,function (next){
    this.populate({
        path:'user',    
        select:'userName photo'
    })
    next();
})

reviewSchema.index({ user: 1, trip: 1, agency: 1, service: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review