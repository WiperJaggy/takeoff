const mongoose = require('mongoose');
const agencyRequestSchema = new mongoose.Schema({
    agencyId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Agecny',
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminResponse : String,
    lissenceCopy:{
        type: String,
        required: [true,'please provide lisence copy']
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
      type: Date
    }
})

agencyRequestSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'agencyId',
      model: 'Agency',
      select: '-__v -passwordConfirm -password',
      populate: [
        {
          path: 'contactPerson',
          select: '-_id'
        },
        {
          path: 'location',
          select: '-_id'
        }
      ]
    });
    next();
  });
const AgencyRequest = mongoose.model('AgencyRequest',agencyRequestSchema);

module.exports = AgencyRequest;