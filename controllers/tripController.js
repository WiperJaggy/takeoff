const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Trip = require('./../models/tripModel');

exports.createTrip = catchAsync(async (req, res, next) => {
    const { agencyId } = req;
    const trip = await Trip.create({ ...req.body, agencyId });
  
    // Populate the agency name in the response
    const populatedTrip = await trip.populate('agencyId', 'name');
  
    res.status(201).json({
      status: 'success',
      data: {
        trip: populatedTrip
      }
    });
  });

exports.getAllTrips = catchAsync(async(req,res,next)=>{
  const trips = await Trip.find();
  res.status(200).json({
    status:'success',
    results: trips.length,
    data:{
      trips
    }
  })
})