const User = require('./../models/userModel')
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const Trip = require('./../models/tripModel')
const Flight = require('../models/flightModel');
const Scholarship = require('../models/scholarshipModel');
const Car = require('./../models/carModel');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const uploadFile = require('../utils/uploadFiles')
const uploadImage = require('../utils/uploadFiles')
// const multerStorage = multer.memoryStorage();
// const multerFilter = (req,file,cb)=>{
//   if(file.mimetype.startsWith('image')){
//      cb(null,true);
//      }else{
//         cb(new AppError('Not an image! Please upload only images.', 400), false);
   
//   }
// }

// const upload = multer({
//    storage: multerStorage,
//    fileFilter: multerFilter
// })
// exports.uploadUserPhoto = upload.single('photo');

// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//     const user= req;
//   if (!req.file) return next();
//   req.file.filename = `user-${user._id}-${Date.now()}.jpeg`;
//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`uploads/img/users/${req.file.filename}`);
//   next();
// });


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'userName', 'email', 'profile.mobile');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: { 'profile.mobile': req.body.mobile , updatedAt: new Date() } }, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
  
    exports.getUser = catchAsync(async (req,res,next) =>{
       const user = await User.findById(req.user.id).select('-password');
       if(!user) return next(new AppError('No user found with that ID',404))
       res.status(200).json({
          status :'success',
          data:{
             user
          }
       })
    })

    exports.getAllUsers = catchAsync(async (req,res,next) =>{
       const users = await User.find().select('-password');
       res.status(200).json({
          status :'success',
          results : users.length,
       users
        })
    })
exports.getMe = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('-password');
    if(!user) return next(new AppError('No user found with that ID',404))
    res.status(200).json({
       status :'success',
       data:{
          user
       }
    })
})



exports.returnCar = catchAsync(async (req, res, next) => {
  // Find the confirmed booking for a car by the car ID
  const booking = await Booking.findOne({
    _id: req.body.bookingId,
    status: 'confirmed',
    bookingType: 'car',
  }).populate('user');

  if (!booking) {
    return next(new AppError('No confirmed car booking found for this ID', 404));
  }

  // Check if the current user is the same as the user who booked the car
  if (booking.user._id.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to return this car', 403));
  }

  // Update the car availability
  const car = await Car.findByIdAndUpdate(
    booking.serviceId,
    { $set: { availability: true } },
    { new: true }
  );

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  // Update the booking status to 'returned'
  booking.status = 'returned';
  await booking.save();

  res.status(200).json({
    status: 'success',
    message:'car returned successfully! thank you for choosing us !',
    data: {
      car,
      booking,
    },
  });
});


exports.uploadPhoto = catchAsync(async (req, res, next) => {
  console.log(req)
  try {
    const publicUrl = await uploadImage(req.file);
    // Store the public URL in the database
    const user = await User.findById(req.user.id);
    user.profile.photo = publicUrl;
    await user.save({ validateBeforeSave: false, runValidators: false });

    res.status(200).send({ fileUrl: publicUrl });
  } catch (error) {
    next(error);
  }
});


exports.getAgencyServices = catchAsync(async (req, res, next) => {
  const { agencyId } = req.body;

  try {
    // Retrieve cars associated with the agency
    const cars = await Car.find({ agencyId: agencyId });

    // Retrieve trips associated with the agency
    const trips = await Trip.find({ agencyId: agencyId });

    // Retrieve scholarships associated with the agency
    const scholarships = await Scholarship.find({ agencyId: agencyId });

    // Retrieve flights associated with the agency
    const flights = await Flight.find({ agencyId: agencyId });

    const services = {
      cars,
      trips,
      scholarships,
      flights
    };

    res.status(200).json({
      status: 'success',
      data: {
        services
      }
    });
  } catch (err) {
    next(err);
  }
});