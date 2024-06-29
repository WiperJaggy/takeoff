const Flight = require('./../models/flightModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Service = require('./../models/serviceModel');
const AgencyService = require('./../models/agencyServiceModel');

exports.createFlight = catchAsync(async (req, res, next) => {
    // Extract the necessary data from the request body
    const {title,flightNumber,oneWay,takeoffCity,takeoffAirport,landingCity,landingAirport,departureDate,eat,airlines,returnDate,availability,availableSeats,price,priceDiscount,serviceType } = req.body;
  
    // Get the agencyId from the authenticated user
    const { agencyId } = req;
  
    // Find the service type in the Service model
    const service = await Service.findOne({ serviceType });
    if (!service) {
      return next(new AppError('Invalid service type provided', 400));
    }
  
    // Check if there is an available agency service for the given agency and service type
    const agencyService = await AgencyService.findOne({ agencyId, serviceId: service._id, available: true });
    if (!agencyService) {
      return next(new AppError('No available agency service found for the given agency and service type', 400));
    }
  
    // Create the new trip
    const flight = await Flight.create({
        title,flightNumber,oneWay,takeoffCity,takeoffAirport,landingCity,landingAirport,departureDate,eat,airlines,returnDate,availability,availableSeats,price,priceDiscount,agencyId
    });
  
    // Populate the agency name and service type in the response
    const populatedFlight = await flight.populate([
      { path: 'agencyId', select: 'name' },
      { path: 'serviceType',  strictPopulate: false ,select: 'serviceType' }
    ]);
  
    res.status(201).json({
      status: 'success',
      data: {
        flight: populatedFlight
      }
    });
  });
 
  exports.updateFlight = catchAsync(async(req,res,next)=>{
    const { id,agencyId } = req.params;
    const updates = req.body; 
  
      // Fetch the existing car
      const existingFlight = await Flight.findById(id).populate('agencyId');
    
      if (!existingFlight) {
        return res.status(404).json({ message: 'Trip not found' });
      }
    
      // Check if the agency is the same
      if (existingFlight.agencyId._id.toString() !== agencyId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this trip' });
      }
  
     const updatedFlight = await Flight.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('agency');
    
      res.status(200).json({
        status:'success',
        updatedFlight});
  })
  exports.getFlight = catchAsync(async(req,res,next)=>{
      const { id } = req.params;
      const flight = await Flight.findById(id).populate([
          { path: 'agencyId', select: 'name' },
          { path:'serviceType',  strictPopulate: false, select:'serviceType' }
      ])
      if(!flight){
          return next(new AppError('Car not found', 404))
      }
      res.status(200).json({
          status:'success',
          data:{
              flight
          }
      })
  })
  exports.deleteFlight= catchAsync(async (req, res, next) => {
    // Find the review by ID
    const existingFlight = await Flight.findById(req.params.id);
  
    // Check if the review exists
    if (!existingFlight) {
      return next(new AppError('No Trips found with that ID', 404));
    }
  
    // Check if the logged-in user is the owner of the review
    if (existingFlight.agencyId.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to delete this review', 403));
    }
    // Delete the review
    await Flight.findByIdAndDelete(req.params.id);
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  exports.getAllFlights= catchAsync(async (req, res, next) => {
    // Retrieve all scholarships
    const flights = await Flight.find().populate([
      { path: 'agencyId', select: 'name' },
      { path:'serviceType',  strictPopulate: false, select:'serviceType' }
  ]);
    res.status(200).json({
        status:'success',
        results: flights.length,
        data: {
          flights
        }
    })
 })