const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Service = require('./../models/serviceModel');
const AgencyService = require('./../models/agencyServiceModel');

exports.createCar = catchAsync(async (req, res, next) => {
    // Extract the necessary data from the request body
    const {carName,carModel,carNumber,carPhoto,carColor,seats,startLocation,availability,price,priceDiscount,serviceType } = req.body;
  
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
    const car = await Car.create({
        carName,carModel,carNumber,carPhoto,carColor,agencyId,seats,startLocation,availability,price,priceDiscount
    });
  
    // Populate the agency name and service type in the response
    const populatedCar = await car.populate([
      { path: 'agencyId', select: 'name' },
      { path: 'serviceType',  strictPopulate: false ,select: 'serviceType' }
    ]);
  
    res.status(201).json({
      status: 'success',
      data: {
        car: populatedCar
      }
    });
  });

exports.getCar = catchAsync(async(req,res,next)=>{
    const { id } = req.params;
    const car = await Car.findById(id).populate([
        { path: 'agencyId', select: 'name' },
        { path:'serviceType',  strictPopulate: false, select:'serviceType' }
    ])
    if(!car){
        return next(new AppError('Car not found', 404))
    }
    res.status(200).json({
        status:'success',
        data:{
            car
        }
    })
})
exports.updateCar = catchAsync(async(req,res,next)=>{
    const { id,agencyId } = req.params;
  const updates = req.body; 

    // Fetch the existing car
    const existingCar = await Car.findById(id).populate('agencyId');
  
    if (!existingCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
  
    // Check if the agency is the same
    if (existingCar.agencyId._id.toString() !== agencyId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this Car' });
    }

   const updatedCar = await Car.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('agency');
  
    res.status(200).json({
      status:'success',
      updatedCar});
})
exports.deleteCar= catchAsync(async (req, res, next) => {
    // Find the review by ID
    const existingCar = await Car.findById(req.params.id);
  
    // Check if the review exists
    if (!existingCar) {
      return next(new AppError('No Cars found with that ID', 404));
    }
  
    // Check if the logged-in user is the owner of the review
    if (existingCar.agencyId.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to delete this Car', 403));
    }
    // Delete the review
    await Car.findByIdAndDelete(req.params.id);
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  exports.getAllCars = catchAsync(async(req,res,next)=>{
    const cars = await Car.find().populate([
        { path: 'agencyId', select: 'name' },
        { path:'serviceType',  strictPopulate: false, select:'serviceType' }
    ])
    res.status(200).json({
        status:'success',
        results:cars.length,
        data:{
            cars
        }
    })
  })