const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync')
const Trip = require('./../models/tripModel');
const Agency = require('./../models/agencyModel')
const Service = require('./../models/serviceModel')
const mongoose = require('mongoose');

// exports.createReview = catchAsync(async (req, res, next) => {
//   const { rating, comment } = req.body;
//   const userId = req.user.id; // Assuming you have a userId in the req.user object

//   let newReview;
//   let reviewType;

//   // Determine the reviewType based on the provided entityId
//   const trip = await Trip.findById(req.params.id);
//   if (trip) {
//     reviewType = 'trip';
//     newReview = new Review({
//       rating,
//       comment,
//       user: userId,
//       trip: req.params.id,
//     });
//   } else {
//     const agency = await Agency.findById(req.params.id);
//     if (agency) {
//       reviewType = 'agency';
//       newReview = new Review({
//         rating,
//         comment,
//         user: userId,
//         agency: req.params.id,
//       });
//     } 
//   }
//   // Save the new review
//   await newReview.save();
//   res.status(201).json(newReview);
// });

exports.createTripReview = catchAsync(async(req,res,next)=>{
  const { tripId,rating, comment } = req.body;
  const userId = req.user.id;
   // Assuming you have a userId in the req.user object
   if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return next(new AppError('Invalid trip ID', 400));
  }
  
  const trip = await Trip.findById(tripId);
  if(!trip){
    return next(new AppError('Trip not found',404))
  }

  // Check if the user has already reviewed this agency
  const existingReview = await Review.findOne({ user: userId, trip: tripId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this agency', 400));
  }
  const newReview = new Review({
    rating,
    comment,
    user: userId,
    trip: tripId,
})
trip.ratingsAverage =
(trip.ratingsAverage * trip.ratingCount + newReview.rating) /
(trip.ratingCount +1 );
trip.ratingCount++;
await trip.save();
await newReview.save();
res.status(201).json(newReview);
})

exports.createAgencyReview = catchAsync(async (req, res, next) => {
  const { agencyId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    return next(new AppError('Invalid agency ID', 400));
  }

  const agency = await Agency.findById(agencyId);
  if (!agency) {
    return next(new AppError('Agency not found', 404));
  }

  // Check if the user has already reviewed this agency
  const existingReview = await Review.findOne({ user: userId, agency: agencyId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this agency', 400));
  }

  const newReview = new Review({
    rating,
    comment,
    user: userId,
    agency: agencyId,
  });

  agency.ratingsAverage =
    (agency.ratingsAverage * agency.ratingCount + newReview.rating) /
    (agency.ratingCount+1 );
  agency.ratingCount++;

  // Save the agency without triggering the password-related validation
  await agency.save( { validateModifiedOnly:true});
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

exports.getReviewsForAgency = catchAsync(async (req, res, next) => {
  // Get the agency ID from the request parameters
  const { agencyId } = req.body;

  // Find all the reviews for the specified agency
  const reviews = await Review.find({ agency: agencyId }).populate({
    path: 'user',
    select: 'name photo'
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.getReviewsForTrip = catchAsync(async (req, res, next) => {
  // Get the agency ID from the request parameters
  const { tripId } = req.body;

  // Find all the reviews for the specified agency
  const reviews = await Review.find({ trip: tripId }).populate({
    path: 'user',
    select: 'name photo'
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});


exports.updateReview = catchAsync(async (req, res, next) => {
  // Find the review by ID
  const review = await Review.findById(req.params.id);

  // Check if the review exists
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if the logged-in user is the owner of the review
  if (review.user._id.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to return this car', 403));
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

  // Find the associated agency or trip document
  const associatedDocument = await (review.agency
    ? Agency.findById(review.agency)
    : Trip.findById(review.trip));

  // Update the averageRating and ratingCount fields in the associated document
  associatedDocument.ratingsAverage =
    (associatedDocument.ratingsAverage * associatedDocument.ratingCount +
      req.body.rating -
      review.rating) /
    associatedDocument.ratingCount;
  await associatedDocument.save({ validateModifiedOnly:true}
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
 if (review.user._id.toString() !== req.user.id) {
  return next(new AppError('You are not authorized to return this car', 403));
}
  // Find the associated agency or trip document
  const associatedDocument = await (review.agency
    ? Agency.findById(review.agency)
    : Trip.findById(review.trip));

  // Update the averageRating and ratingCount fields in the associated document
  associatedDocument.ratingsAverage =
    (associatedDocument.ratingsAverage * associatedDocument.ratingCount -
      review.rating) /
    (associatedDocument.ratingCount - 1);
  associatedDocument.ratingCount--;
  await associatedDocument.save({ validateModifiedOnly:true});

  // Delete the review
  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
