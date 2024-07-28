const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Trip = require('./../models/tripModel');
const Service = require('./../models/serviceModel');
const AgencyService = require('./../models/agencyServiceModel');

exports.createTrip = catchAsync(async (req, res, next) => {
  // Extract the necessary data from the request body
  const { title, description, price,startLocation, startDate, endDate, destination, itinerary, availability,maxGroupSize,availableSeats,priceDiscount, serviceType } = req.body;

  // Get the agencyId from the authenticated user
  const { agencyId } = req;

  // Find the service type in the Service model
  const service = await Service.findOne({ serviceType });
  if (!service) {
    return next(new AppError('Invalid service type provided', 400));
  }

  // Check if there is an available agency service for the given agency and service type
  const agencyService = await AgencyService.findOne({ agencyId, serviceId: service._id, available: true });
  console.log(agencyId,serviceType,service)
  if (!agencyService) {
    return next(new AppError('No available agency service found for the given agency and service type', 400));
  }

  // Create the new trip
  const trip = await Trip.create({
    title,
    startLocation,
    description,
    price,
    startDate,
    endDate,
    destination,
    itinerary,
    availability,
    priceDiscount,
    agencyId,
    availableSeats:maxGroupSize,
    maxGroupSize
  });

  // Populate the agency name and service type in the response
  const populatedTrip = await trip.populate([
    { path: 'agencyId', select: 'name' },
    { path: 'serviceType',  strictPopulate: false ,select: 'serviceType' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      trip: populatedTrip
    }
  });
});
exports.getTrip = catchAsync(async(req,res,next)=>{
  const { id } = req.params;

  // Fetch the trip from the database
  const trip = await Trip.findById(id).populate([
    { path: 'agencyId', select: 'name' },
    { path: 'serviceType',  strictPopulate: false ,select: 'serviceType' }
  ]);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  res.status(200).json({
    status:'success',
    trip});
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

 exports.updateTrip = catchAsync(async (req, res) => {
  const { id } = req.params;
  //const { title, description, price,startLocation,agencyId, startDate, endDate, destination, itinerary, availability,maxGroupSize,availableSeats,priceDiscount, serviceType } = req.body;
const {agencyId ,...updates} = req.body; 
  // Fetch the existing trip
  const existingTrip = await Trip.findById(id).populate('agencyId');

  if (!existingTrip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  // Check if the agency is the same
  if (existingTrip.agencyId._id.toString() !== agencyId.toString()) {
    return res.status(403).json({ message: 'You are not authorized to update this trip' });
  }

  // Check if the trip start date is less than 2 days away
  const timeDiff = new Date(updates.startDate || existingTrip.startDate) - new Date();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  if (daysDiff < 2) {
    return res.status(400).json({ message: 'You cannot modify a trip that starts in less than 2 days' });
  }
 // Update the trip with the provided fields and the current date for updatedAt
 const updatedTrip = await Trip.findByIdAndUpdate(
  id,
  { ...updates, updatedAt: new Date() },
  { new: true, runValidators: true }
).populate('agency');

  res.status(200).json({
    status:'success',
    updatedTrip});
});


  exports.deleteTrip= catchAsync(async (req, res, next) => {
    // Find the review by ID
    const existingTrip = await Trip.findById(req.params.id);
  
    // Check if the review exists
    if (!existingTrip) {
      return next(new AppError('No Trips found with that ID', 404));
    }
  
    // Check if the logged-in user is the owner of the review
    if (existingTrip.agencyId.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to delete this review', 403));
    }
    const timeDiff = new Date(existingTrip.startDate) - new Date();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (daysDiff < 2) {
      return res.status(400).json({ message: 'You cannot delte a trip that starts in less than 2 days' });
    }
    // Delete the review
    await Trip.findByIdAndDelete(req.params.id);
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });