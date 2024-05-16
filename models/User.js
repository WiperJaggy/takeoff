const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Please provide username'],
        minlength: 3,
        maxlength: 50,
    },
    identifier:{
        type: Number,
        unique: true,
        required: [true, 'Please provide identifier']
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
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'agency'],
        default: 'user',
    },

    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    birthdate: {
        type: Date,
    },
    registrationTime: {
        type: Date,
        required: true,
    },
    photo: {
        type: String,
    },
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
