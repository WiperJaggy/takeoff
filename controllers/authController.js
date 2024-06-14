const {promisify} =require('util');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Agency = require('./../models/agencyModel')
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync')
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { updateSearchIndex } = require('../models/requests');
const AgencyRequest = require('./../models/agencyRequestModel')
const signToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  };
  
  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
  
    // Remove sensitive data from the output
    user.password = undefined;
  
    let responseData;
    if (user.name && user.contactPerson.firstName && user.contactPerson.lastName) {
      // Agency registration
      responseData = {
        agency: user,
      };
    } else {
      // User registration
      responseData = {
        user,
      };
    }
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: responseData,
    });
  };


  exports.registerUser =  catchAsync(async(req, res, next) =>{
    if (await User.findOne({ userName: req.body.userName }) || await User.findOne({email: req.body.email})) {
        return next(new AppError('user already exists', 400));
    }
    const newUser = await User.create({
        userName: req.body.userName,
        email:req.body.email,
        identifier:req.body.identifier,
        profile:{
        firstName: req.body.profile.firstName,
        lastName:req.body.profile.lastName,
        birthdate: req.body.profile.birthdate},
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt :req.body.passwordChangedAt
    })
    createSendToken(newUser,201,res)
})
exports.registerAgency = catchAsync(async (req, res, next) => {
  if (await Agency.findOne({ email: req.body.email })) {
    return next(new AppError('Agency already exists', 400));
  }

  const newAgency = await Agency.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    location: req.body.location,
    contactPerson: {
      firstName: req.body.contactPerson.firstName,
      lastName: req.body.contactPerson.lastName,
      email: req.body.contactPerson.email,
      ownersId: req.body.contactPerson.ownersId,
      phoneNumber: req.body.contactPerson.phoneNumber,
      mobile: req.body.contactPerson.mobile,
    },
  });

  // Create a new AgencyRequest document
  const agencyRequest = await AgencyRequest.create({
    agencyId: newAgency._id,
    lissenceCopy: req.body.lissenceCopy,
  });

  // Send the response after creating both documents
  createSendToken(newAgency, 201, res);
});

       exports.loginUser = catchAsync(async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  // 1. Check if the email/username and password exist
  if (!emailOrUsername || !password) {
    return next(new AppError('Please provide email/username and password', 400));
  }

  // 2. Check if the user exists and password is correct
  let user;
  if (emailOrUsername.includes('@')) {
    // If emailOrUsername contains '@', assume it's an email
    user = await User.findOne({ email: emailOrUsername }).select('+password');
  } else {
    // Otherwise, assume it's a username
    user = await User.findOne({ userName: emailOrUsername }).select('+password');
  }

  if ((!user || !await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email/username or password', 401));
  }

  // 3. Everything is correct, send token to client
  if (user) {
    createSendToken(user, 200, res);
  }
});

exports.loginAgency = catchAsync(async (req,res,next)=>{
  const {email,password} = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  let agency;
    agency = await Agency.findOne({ email: email }).select('+password');
  if ((!agency || !await agency.comparePassword(password, agency.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (agency) {
    createSendToken(agency, 200, res);
  }


})

exports.protect = catchAsync(async(req, res, next) =>{
    //1. getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access',401))
    }
    //2. verification token
    const decoded = await promisify(jwt.verify)(token,process.env.ACCESS_TOKEN_SECRET);
   // console.log(decoded);
    //3. check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist',401))
    }
    //4. check if user changed password after the token was issued
   if( currentUser.changedPasswordAfter(decoded.iat)){
    return next (new AppError ('User recentrly changed password please log in again ',401))
   }
   
   
   //Grant Access to protected route
    req.user = currentUser;
   next();
})

exports.protectAgency = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);

  // 3. Check if agency still exists
  const currentAgency = await Agency.findById(decoded.id);
  if (!currentAgency) {
    return next(new AppError('The agency belonging to this token does no longer exist', 401));
  }

  // 4. Check if agency changed password after the token was issued
  if (currentAgency.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Agency recently changed password. Please log in again', 401));
  }

  // Grant access to protected route
  req.agency = currentAgency;
  req.agencyId = currentAgency._id;
  next();
});
exports.restrictTo= (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action',403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get user or agency based on the posted email
    const { email } = req.body;
    const user = await User.findOne({ email });
    const agency = await Agency.findOne({ email });
  
    if (!user && !agency) {
      return next(new AppError('There is no user or agency with this email!', 404));
    }
  
    // Find the appropriate document for password reset
    const resetDocument = user || agency;
  
    // 2. Generate the random reset token
    const resetToken = resetDocument.createPasswordResetToken();
    await resetDocument.save({ validateBeforeSave: false });
  
    // 3. Send the reset token to the user/agency's email
    const resetURL = `${req.protocol}://${req.get('host')}/auth/resetPassword/${resetToken}`;
  
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;
  
    try {
      await sendEmail({
        email: resetDocument.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message,
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      resetDocument.passwordResetToken = undefined;
      resetDocument.passwordResetExpires = undefined;
      await resetDocument.save({ validateBeforeSave: false });
  
      return next(new AppError('There was an error sending the email. Please try again later!', 500));
    }
  });
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1. Get user or agency based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    const agency = await Agency.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
  
    // Find the appropriate document for password reset
    const resetDocument = user || agency;
  
    // 2. If the token has not expired and there is a user/agency, set the new password
    if (!resetDocument) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
  
    resetDocument.password = req.body.password;
    resetDocument.passwordConfirm = req.body.passwordConfirm;
    resetDocument.passwordResetToken = undefined;
    resetDocument.passwordResetExpires = undefined;
    await resetDocument.save({ validateBeforeSave: false });
  
    // 3. Update the changedPassordAt property for the user/agency
  
    // 4. Log the user/agency in and send JWT
    createSendToken(resetDocument, 200, res);
  });
    exports.updatePassword = catchAsync(async(req,res,next)=>{
        //1.get user from colletion
        const user = await User.findById(req.user.id).select('+password');
        //2.check if POSTed current password is correct
        if(!(await user.comparePassword(req.body.passwordCurrent, user.password))){
            return next(new AppError('your current password is wrong',401))
        }
        //3.if so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
        //4. log user in , send JWT
    
        createSendToken(user,200,res)
    })
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
