const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    agencyId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Agency',
        required: true
    },
    carName:{
        type:String,
        required:[true, 'Please provide a car name']
    },
    carModel:{
        type:String,
        required:[true, 'Please provide a car model']
    },
    carNumber:{
        type: Number,
        required:[true, 'Please provide a car number'],
        unique: true
    },
    carPhoto:{
        type:String,
    },
    carColor:{
        type:String,
        required:[true, 'Please provide a car color']
    },
    seats:{
        type:Number,
        min:1,
        max:7,
        required:[true, 'Please provide the number of seats']
    },
    startLocation:{
        //GeoJSon
        type:{
            type: String,
            default: 'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
availability:{
    type:Boolean,
    default:true
},
price:{
    type: Number,
    required :[true, 'A car must have a price']
},
priceDiscount:{
    type: Number,
    min:0,
    max:100,
    default:0
},
createdAt:{
    type: Date,
    default: Date.now()
},
updatedAt: {
    type: Date,
}

})
carSchema.virtual('agency', {
    ref: 'Agency',
    localField: 'agency',
    foreignField: '_id',
    justOne: true
  });
const Car = mongoose.model('Car',carSchema);
module.exports = Car;