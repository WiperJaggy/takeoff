const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
serviceType :{
    type:String,
    required: [true,'please provide the type of the service'],
    unique:true
},
createdAt:{
    type:Date,
    default:Date.now()
}

})
const Service = mongoose.model('Service',serviceSchema);
module.exports = Service;