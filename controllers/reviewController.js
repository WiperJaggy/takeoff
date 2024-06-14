const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync')
const Trip = require('./../models/tripModel');
const Agency = require('./../models/agencyModel')
const Service = require('./../models/serviceModel')

exports.createReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const userId = req.user.id; // Assuming you have a userId in the req.user object

  let newReview;
  let reviewType;

  // Determine the reviewType based on the provided entityId
  const trip = await Trip.findById(req.params.id);
  if (trip) {
    reviewType = 'trip';
    newReview = new Review({
      rating,
      comment,
      user: userId,
      trip: req.params.id,
    });
  } else {
    const agency = await Agency.findById(req.params.id);
    if (agency) {
      reviewType = 'agency';
      newReview = new Review({
        rating,
        comment,
        user: userId,
        agency: req.params.id,
      });
    } else {
      const service = await Service.findById(req.params.id);
      if (service) {
        reviewType = 'service';
        newReview = new Review({
          rating,
          comment,
          user: userId,
          service: req.params.id,
        });
      } else {
        return next(new AppError('Invalid entity ID', 400));
      }
    }
  }
  // Save the new review
  await newReview.save();
  res.status(201).json(newReview);
});

exports.getAllReviews = catchAsync(async(req,res,next)=>{
  const reviews = await Review.find();
  res.status(200).json({
    status:'success',
    results: reviews.length,
    data:{
      reviews
    }
  })
})
exports.updateReview = catchAsync(async (req, res, next) => {
  // Find the review by ID
  const review = await Review.findById(req.params.id);

  // Check if the review exists
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if the logged-in user is the owner of the review
  if (review.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to update this review', 403));
  }

  // Update the review
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating: req.body.rating,
      comment: req.body.comment,
      updatedAt: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview
    }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  // Find the review by ID
  const review = await Review.findById(req.params.id);

  // Check if the review exists
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if the logged-in user is the owner of the review
  if (review.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete this review', 403));
  }

  // Delete the review
  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});