const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const agencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An Agency must have a name'],
        validate: {
          validator: (value) => {
            // Trim leading and trailing spaces
            const trimmedValue = value.trim();
    
            // Check if the trimmed value contains only letters (Arabic or English) and spaces, and doesn't start or end with a space
            return /^[\u0600-\u06FF\u0020\u00C0-\u00FF\w]+[\u0600-\u06FF\u0020\u00C0-\u00FF\w]*[\u0600-\u06FF\u0020\u00C0-\u00FF\w]+$/.test(trimmedValue);
          },
          message: 'The name must contain only letters (Arabic or English) and spaces, and cannot start or end with a space.',
        },
      },
    email:{
        type:String,
        required :[true,'Please provide Agency Email'],
        unique : true,
        lowercase:true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
    },
    password:{
        type:String,
        required :[true, 'Please provide a Password'],
        minlength:8,
        select:false,
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
    tourist_commercial:{
        type: String,
        required:[true,'An agency must choose between tourism or commercial number'],
        enum:['commercial','tourism']
    },
    cotoNumber: {
        type: String,
        unique: true,
        required: true,
        validate: {
          validator: (value) => {
            // Check if the value is a 5-digit number and contains no symbols, letters, or spaces
            return /^\d{5}$/.test(value.trim());
          },
          message: 'Commercial number must be a 5-digit number and cannot contain any symbols, letters, or spaces.',
        },
      },
      photo:String,
    contactPerson:{
        firstName:{
            type: String,
            required: [true, 'An Agency must have a name'],
            validate: {
              validator: (value) => {
                // Trim leading and trailing spaces
                const trimmedValue = value.trim();
        
                // Check if the trimmed value contains only letters (Arabic or English) and spaces, and doesn't start or end with a space
                return /^[\u0600-\u06FF\u0020\u00C0-\u00FF\w]+$/.test(trimmedValue) && trimmedValue.length > 0 && trimmedValue[0] !== ' ' && trimmedValue[trimmedValue.length - 1] !== ' ';
              },
              message: 'The last name must contain only letters (Arabic or English) and spaces, and cannot start or end with a space.',
            },
          },
        lastName:{
            type: String,
            required: [true, 'An Agency must have a name'],
            validate: {
              validator: (value) => {
                // Trim leading and trailing spaces
                const trimmedValue = value.trim();
        
                // Check if the trimmed value contains only letters (Arabic or English) and spaces, and doesn't start or end with a space
                return /^[\u0600-\u06FF\u0020\u00C0-\u00FF\w]+$/.test(trimmedValue) && trimmedValue.length > 0 && trimmedValue[0] !== ' ' && trimmedValue[trimmedValue.length - 1] !== ' ';
              },
              message: 'The last name must contain only letters (Arabic or English) and spaces, and cannot start or end with a space.',
            },
          },
        birthDate: {
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
        mobile:{
            type:String,
            required:[true,"An Agency must have a Mobile Number"],
            validate: {
                validator: (value) => {
                  // Check if the value is a 10-digit number starting with '09' and contains no symbols, letters, or spaces
                  return /^09\d{8}$/.test(value.trim());
                },
                message: 'Mobile number must be a 10-digit number starting with "09" and cannot contain any symbols, letters, or spaces.',
              },
        },
        email:{
            type:String,
            required :[true,'Please provide Agency Email'],
            lowercase:true,
            validate:[validator.isEmail,'Please provide a valid Email']
        },
        ownersId:{
            type: String,
            unique: [true, 'This identifier is already in use.'],
            required: [true, 'Please provide your identifier.'],
            validate: {
                validator: function(value) {
                    return /^\d{11}$/.test(value);
                },
                message: 'Identifier must be 11 digits long.'
            }
        }
    },
    phoneNumber:{
        type:String,
        required:[true,"An Agency must have a Phone Number"],
        validate: {
            validator: (value) => {
              // Check if the value is a 10-digit number starting with '09' and contains no symbols, letters, or spaces
              return /^0\d{9}$/.test(value.trim());
            },
            message: 'Phone number must be a 10-digit number starting with "0" for the city code. and cannot contain any symbols, letters, or spaces.',
          },
    },
    agencyMobile:{
        type:String,
        required:[true,"An Agency must have a Mobile Number"],
        validate: {
            validator: (value) => {
              // Check if the value is a 10-digit number starting with '09' and contains no symbols, letters, or spaces
              return /^09\d{8}$/.test(value.trim());
            },
            message: 'Mobile number must be a 10-digit number starting with "09" and cannot contain any symbols, letters, or spaces.',
          }},
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
    updatedAt: {
        type: Date,
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