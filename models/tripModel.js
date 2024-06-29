const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'please provide a title for the trip']

    },  
    agencyId:{
        type: mongoose.Schema.ObjectId,
        ref:'Agency',
        required:[true, 'A trip must belong to an agency']
        },
        description:{
            type:String,
            required: [true,'Please provide trip description']
            },
            startDate:{
                type:Date,
                required:[true, "A Tour must have a startDate"]
            },
            endDate:{
                type:Date,
                required:[true, "A Tour must have a endDate"]
            },
            price:{
                type: Number,
                required :[true, 'A tour must have a price']
            },
             priceDiscount: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
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
            destination:{
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
    itinerary:[
        { 
        type:{
            type: String ,
            default : 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number 
    }
    ],
    maxGroupSize:{
        type:Number,
        required:[true, "A Tour must have a maxGrouppSize"]
    },
    availableSeats:{
        type:Number,
        default: this.maxGroupSize
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    },
    availability:{
        type: Boolean,
        default: true
    },
    updatedAt:{
        type: Date
    }
    // ratingsAverage:{
    //     type:Number,
    //     default:4.5,
    //     min:[1,"the minimum rating is 1"],
    //     max:[5,"the maximum rating is 5"],
    //     set: val => Math.round(val*10)/10
    // },
    // ratingsQuantity:{
    //     type:Number,
    //     default:0
    // },
    //  rating:{
    //     type: Number,
    //     default :4.5,
    //     min:[1,'the minimum rating is 1'],
    //     max:[5,'the maximum rating is 5']
    // },
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
tripSchema.virtual('agency', {
    ref: 'Agency',
    localField: 'agency',
    foreignField: '_id',
    justOne: true
  });
 const Trip = mongoose.model('Trip', tripSchema);
 module.exports = Trip;