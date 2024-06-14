const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
serviceName :{
    type:String,
    required: [true,'please provide ']
},
description:{
    type:String,
    required: [true,'please provide some decription about your service']
},
available:{
    type:Boolean,
    default:true
},
createdAt:{
    type:Date,
    default:Date.now()
}

})



const Service = mongoose.model('Service',serviceSchema);
module.exports = Service;