const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        const { email, username, password, confirmPassword , identifier } = req.body;

        if (password !== confirmPassword) {   
        const error = new Error('Password and confirm password do not match');
        error.statusCode = 400;
        throw error;
        }

        const emailAlreadyExists = await User.findOne({ email });
        if (emailAlreadyExists) {
            const error = new Error('Email already exists');
            error.statusCode = 400;
            throw error;
        }

        const usernameAlreadyExists = await User.findOne({ username });
        if (usernameAlreadyExists) {
            const error = new Error('username already exists');
            error.statusCode = 400;
            throw error;
        }

        // first registered user is an admin
        const isFirstAccount = (await User.countDocuments({})) === 0;
        const role = isFirstAccount ? 'admin' : 'user';

        const newUser = new User({ username, email, password, role , identifier });
        newUser.registrationTime = Date.now();

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}
        //exports.registerAgency = 


exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        const error = new Error('Please provide username and password');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ username: username });
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { username: user.username, userId: user._id.toString(), role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '24h' }
    )
    res.status(200).json({ token: token, userId: user._id.toString(), username: username });

};


// exports.adminLogin = async (req, res, next) => {
//     try {
//         const { username, password } = req.body;

//         if (!username || !password) {
//             throw new CustomError.BadRequestError('Please provide username and password');

//         }

//         const user = await User.findOne({ username: username, role: 'admin' });
//         if (!user) {
//             throw new CustomError.UnauthenticatedError('Invalid Credentials');
//         }

//         const isPasswordCorrect = await bcrypt.compare(password, user.password);
//         if (!isPasswordCorrect) {
//             throw new CustomError.UnauthenticatedError('Invalid Credentials');
//         }

//         const token = jwt.sign(
//             { username: user.username, userId: user._id.toString(), role: user.role },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '24h' }
//         )

//         res.status(200).json({ message: 'Admin login successful', token: token, userId: user._id.toString(), username: username });
//     }
//     catch (err) {
//         if (!err) {
//             throw new CustomError.InternalServerError();
//         }
//         next(err);
//     }
// };
