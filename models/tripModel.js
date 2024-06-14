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
            price:{
                type: Number,
                required :[true, 'A tour must have a price']
            },
            startDate:{
                type:Date,
                required:[true, "A Tour must have a startDate"]
                },
                endDate:{
                    type:Date,
                    required:[true, "A Tour must have a endDate"]
                    },
                    destination:{
                        type:String,
                        required:[true, "A Tour must have a destination"]
                        },
                            priceDiscount: {
                                type:Number,
                                validate:{
                                   validator: function(val){
                                       //this only points to current doc on New document creation
                                       return val < this.price;
                                   },
                                   message:'the price discount ({VALUE}) must be less than the price'
                                }
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
    locations:[
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
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
tripSchema.pre(/^find/, function(next) {
    this.agencyId = function() {
        return this.agencyId;
      }
    next();
    });

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip