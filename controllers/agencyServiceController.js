const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const AgencyService = require('./../models/agencyServiceModel');
const AgencyRequest = require('../models/agencyRequestModel');

exports.createService = catchAsync(async (req, res, next) => {
  const agencyId = req.agency.id;
  const agencyRequest = req.query.agencyRequest;
  const { serviceType, description,price,discountPercentage } = req.body;
  
  // Check if the service already exists in the Service collection
  let request = await AgencyRequest.findById(agencyRequest);
  let service = await Service.findOne({ serviceType });

  if(request.status !== 'approved'){
    return next(new AppError('This agency request is not approved yet. Please try again later.', 400));
  }
  if (!service) {
    return next(new AppError('The service you are trying to provide is not included. Please reach the admin to add it.', 400));
  }

  // Check if the service is already associated with the agency
  const existingAgencyService = await AgencyService.findOne({
    agencyId,
    serviceId: service._id,
  });

  if (existingAgencyService) {
    return next(
      new AppError(
        'This service is already associated with your agency. You cannot add it again.',
        400
      )
    );
  }

  // Calculate the license expiry date
  const licenseExpiryDate = new Date();
  licenseExpiryDate.setFullYear(licenseExpiryDate.getFullYear() + 1);

  // Create a new agencyServices document
  const newAgencyService = await AgencyService.create({
    agencyId,
    serviceId: service._id,
    licenseExpiryDate,
    description,
    price,
    discountPercentage
  });

  res.status(201).json({ service , agencyService: newAgencyService });
});

exports.updateService = catchAsync(async (req, res, next) => {
  // Find the agencyService by ID
  const agenService = await AgencyService.findById(req.params.id);

  // Check if the agencyService exists
  if (!agenService) {
    return next(new AppError('No agencyService found with that ID', 404));
  }

  // Check if the logged-in agency is the owner of the agencyService
  if (agenService.agencyId._id.toString() !== req.agency.id) {
    return next(new AppError('You are not authorized to update this agencyService', 403));
  }

  const updatedFields = {
    updatedAt: Date.now()
  };

  // Check if the description is provided in the request body
  if (req.body.description) {
    updatedFields.description = req.body.description;
  }
  if (req.body.available) {
    updatedFields.available = req.body.available;
  }

  // Check if the price is provided in the request body
  if (req.body.price) {
    updatedFields.price = req.body.price;
    updatedFields.priceAfterDiscount = req.body.price * (1 - (agenService.discountPercentage / 100));
  }

  // Check if the discount percentage is provided in the request body
  if (req.body.discountPercentage) {
    updatedFields.discountPercentage = req.body.discountPercentage;
    updatedFields.priceAfterDiscount = agenService.basePrice * (1 - (req.body.discountPercentage / 100));
  }

  // Update the agencyService
  const updatedAgencyService = await AgencyService.findByIdAndUpdate(
    req.params.id,
    updatedFields,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      agenService: updatedAgencyService
    }
  });
});

  exports.getAllAgencyServices=catchAsync(async(req,res,next)=>{
    const agencyServices = await AgencyService.find();
    res.status(200).json({
      status:'success',
      results: agencyServices.length,
      data:{
        agencyServices
      }
    })

  })

  exports.getAgencyServices = catchAsync(async (req, res, next) => {
    // Find all the agencyServices for the logged-in agency
    const agencyServices = await AgencyService.find({
      agencyId: req.agency.id
    });
  
    res.status(200).json({
      status: 'success',
      results: agencyServices.length,
      data: {
        services: agencyServices
      }
    });
  });

  exports.deleteAgencyService = catchAsync(async(req,res,next)=>{
    const agenService = await AgencyService.findById(req.params.id);

    // Check if the agencyService exists
    if (!agenService) {
      return next(new AppError('No agencyService found with that ID', 404));
    }
    console.log(agenService.agencyId._id.toString() )
    if (agenService.agencyId._id.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to update this agencyService', 403));
    }

    await AgencyService.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    message:'The service has been deleted successfully',
    data: null
  });
  })
  exports.getAgencyService = catchAsync(async (req, res, next) => {
    // Find the agencyService by its ID
    const agencyService = await AgencyService.findById(req.params.id);
  
    // Check if the agencyService exists
    if (!agencyService) {
      return next(new AppError('No agencyService found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        service: agencyService
      }
    });
  });

  exports.getMyService = catchAsync(async(req,res,next)=>{
    const agencyService = await AgencyService.findById(req.params.id);
    if (agencyService.agencyId._id.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to get this agencyService', 403));
    }
    res.status(200).json({
      status:'success',
      data:{
        agencyService
      }
    })
  })