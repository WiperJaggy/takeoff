const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const agencySchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'An Agency must have a name']
    },
    email:{
        type:String,
        required :[true,'Please provide Agency Email'],
        unique : true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid Email']
    },
    password:{
        type:String,
        required :[true, 'Please provide a Password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required :[true, 'Please confirm your password'],
        validate:{
            //this only works on Create and Save !!!
            validator :function(el){
                return el === this.password; 
            },
            message: 'Passwords are not the same'
        }
    }, 
      photo:String,
    contactPerson:{
        firstName:{
            type:String,
            required: [true,'please provide the owners first name']
        },
        lastName:{
            type:String,
            required: [true,'please provide the owners last name']
        },
        
        phoneNumber:{
            type:String,
            required:[true,"An Agency must have a Phone Number"]
        },
        mobile:{
            type:String,
            required:[true,"An Agency must have a Mobile Number"]
        },
        email:{
            type:String,
            required :[true,'Please provide Agency Email'],
            lowercase:true,
            validate:[validator.isEmail,'Please provide a valid Email']
        },
        ownersId:{
            type: Number,
            required :[true , 'You must Provide the owners Identifier']
        }
    },
    location:{
        //GeoJSon
        type:{
            type: String,
            default: 'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address: String,
    },
createdAt:{type: Date,
    default: Date.now()
},
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires:Date,
})

agencySchema.pre(/^find/,function(next){
    //this points to the current query
    this.find({active: {$ne:false}})
next();
})

 agencySchema.pre('save',  function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt= Date.now() -1000;
     next();
 })

 agencySchema.pre('save', async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified('password'))return next();
    //HAsh password with cost of 12
    this.password =await bcrypt.hash(this.password,12)
    //delete passwordConfirm field
    this.passwordConfirm =undefined;
    next();
    })
    
//this creates an instance method that holds a function that compare hashed password which is stored in the database and the password that the user send in post.
agencySchema.methods.comparePassword = async function (candidiatePassword,userPassword){
    return await bcrypt.compare(candidiatePassword,userPassword);
}

agencySchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
       /// console.log(changedTimestamp , JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}
  


agencySchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken},this.passwordResetToken);
    this.passwordResetExpires = Date.now()+10*60*1000;
    return resetToken;
}




const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;