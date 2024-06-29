const Service = require('./../models/serviceModel');
const catchAsync = require('./../utils/catchAsync')

exports.addService = catchAsync(async (req, res, next) => {
    const { serviceType } = req.body;
  
    // Create a new service document with the provided serviceType
    const newService = await Service.create({ serviceType });
  
    res.status(201).json({
      status: 'success',
      message: 'New service added successfully.',
      data: {
        service: newService
      }
    });
  });

  exports.deleteService = catchAsync(async (req, res, next) => {
    // Find the service by ID
    const service = await Service.findById(req.params.id);
  
    // Check if the service exists
    if (!service) {
      return next(new AppError('No service found with that ID', 404));
    }
  
    // Delete the service
    await Service.findByIdAndDelete(req.params.id);
  
    res.status(204).json({
      status: 'success',
      message: 'Service deleted successfully.'
    });
  });


  exports.getAllServices = catchAsync(async (req, res, next) => {
    // Retrieve all services
    const services = await Service.find();
  
    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  });
  