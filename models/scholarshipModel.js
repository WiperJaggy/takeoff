const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    agencyId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Agency',
        required: true
    },
    applicationName:{
        type: String,
        required: true,
        unique:true
    },
    applicationType:{
        type: String,
    required: true,
    enum: ['fully funded', 'semi funded','not funded']
    },
    donor:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    applicationOpening:{
        type: Date,
        required: true
    },
    seats:{
        type: Number,
    },
    applicationDeadline:{
        type: Date,
        required: true
    },
    applicationLink: {
        type: String,
        required: true,
        validate: {
          validator: function(v) {
            return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
          },
          message: props => `${props.value} is not a valid URL!`
        }
      },
     eligibility: {
        type: String,
        required: true
      },
    benefits:{
        type: String,
        required: true
    },
    requiredDocuments:{
        type: [String],
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
scholarshipSchema.virtual('agency', {
    ref: 'Agency',
    localField: 'agency',
    foreignField: '_id',
    justOne: true
  });


const Scholarship = mongoose.model('Scholarship',scholarshipSchema);

module.exports = Scholarship;