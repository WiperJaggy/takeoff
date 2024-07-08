const User = require('./../models/userModel')
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
     cb(null,true);
     }else{
        cb(new AppError('Not an image! Please upload only images.', 400), false);
   
  }
}

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    const user= req;
  if (!req.file) return next();
  req.file.filename = `user-${user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/img/users/${req.file.filename}`);
  next();
});
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