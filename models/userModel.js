const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: [true, 'Please provide username'],
        minlength: 3,
        maxlength: 50,
        match: [/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, periods, hyphens, and underscores.'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
        validate: {
            validator: function(value) {
                return !value.includes(' ');
            },
            message: 'Password must not contain any spaces.'
        }
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
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    profile:{ 
     firstName: {
        type: String,
        required:[true, "Please Provide your first name."]
    },
    lastName: {
        type: String,
        required:[true, "Please Provide your last name."]
    },
    photo: String,
    birthdate: {
        type: Date,
        required: [true, 'Please provide your birthdate'],
        validate: {
            validator: function(value) {
                const today = new Date();
                const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return value <= eighteenYearsAgo && value <= today;
            },
            message: 'Birthdate must be a valid date and the user must be at least 18 years old.'
        }
    },
    identifier: {
        type: String,
        unique: [true, 'This identifier is already in use.'],
        required: [true, 'Please provide your identifier.'],
        validate: {
            validator: function(value) {
                return /^\d{11}$/.test(value);
            },
            message: 'Identifier must be 11 digits long.'
        }
    },
    mobile:{
        type:String,
        required:[true,"A User must have a Mobile Number"],
        validate: {
            validator: (value) => {
              // Check if the value is a 10-digit number starting with '09' and contains no symbols, letters, or spaces
              return /^09\d{8}$/.test(value.trim());
            },
            message: 'Mobile number must be a 10-digit number starting with "09" and cannot contain any symbols, letters, or spaces.',
          },
    } 

} ,  
    createdAt: { type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String,
        select : false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires:Date,
    verificationTokenExpires:Date
});


    
userSchema.pre(/^find/,function(next){
    //this points to the current query
    this.find({active: {$ne:false}})
next();
})

 userSchema.pre('save',  function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt= Date.now() -1000;
     next();
 })

 userSchema.pre('save', async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified('password'))return next();
    //HAsh password with cost of 12
    this.password =await bcrypt.hash(this.password,12)
    //delete passwordConfirm field
    this.passwordConfirm =undefined;
    next();
    })
    
//this creates an instance method that holds a function that compare hashed password which is stored in the database and the password that the user send in post.
userSchema.methods.comparePassword = async function (candidiatePassword,userPassword){
    return await bcrypt.compare(candidiatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
       /// console.log(changedTimestamp , JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}
  


userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken},this.passwordResetToken);
    this.passwordResetExpires = Date.now()+10*60*1000;
    return resetToken;
}

userSchema.methods.createVerificationToken = function(){
    const verification = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(verification).digest('hex');
    console.log({verification},this.verificationToken);
    this.verificationTokenExpires = Date.now()+ 24 * 60 * 60 * 1000;
    return verification;
}

const User = mongoose.model('User',userSchema);
module.exports = User;