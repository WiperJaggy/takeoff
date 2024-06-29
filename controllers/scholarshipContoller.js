const Scholarship = require('./../models/scholarshipModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Service = require('./../models/serviceModel');
const AgencyService = require('./../models/agencyServiceModel');

exports.createScholarship = catchAsync(async (req, res, next) => {
    // Extract the necessary data from the request body
  const {applicationName,applicationType,donor,description,applicationOpening,seats,applicationDeadline,applicationLink,eligibility,benefits,requiredDocuments,serviceType}= req.body;
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
    const scholarship = await Scholarship.create({
        applicationName,
        applicationType,
        donor,
        description,
        applicationOpening,
        seats,
        applicationDeadline,
        applicationLink,
        eligibility,
        benefits,
        requiredDocuments,
        agencyId,  
    });
  
    // Populate the agency name and service type in the response
    const populatedScholarship = await scholarship.populate([
      { path: 'agencyId', select: 'name' },
      { path: 'serviceType',  strictPopulate: false ,select: 'serviceType' }
    ]);
  
    res.status(201).json({
      status: 'success',
      data: {
        scholarship: populatedScholarship
      }
    });
  });

  exports.getScholarship = catchAsync(async(req,res,next)=>{
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id).populate([
        { path: 'agencyId', select: 'name' },
        { path:'serviceType',  strictPopulate: false, select:'serviceType' }
    ])
    if(!scholarship){
        return next(new AppError('Car not found', 404))
    }
    res.status(200).json({
        status:'success',
        data:{
            scholarship
        }
    })
})

  exports.updateScholarship = catchAsync(async(req,res,next)=>{
    const { id,agencyId } = req.params;
    const updates = req.body; 
  
      // Fetch the existing car
      const existingScholarship = await Scholarship.findById(id).populate('agencyId');
    
      if (!existingScholarship) {
        return res.status(404).json({ message: 'Trip not found' });
      }
    
      // Check if the agency is the same
      if (existingScholarship.agencyId._id.toString() !== agencyId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this trip' });
      }
  
      const updatedScholarship = await Scholarship.findByIdAndUpdate(
        id,
        [
          {
            $set: {
              requiredDocuments: {
                $concatArrays: [
                  '$requiredDocuments',
                  updates.requiredDocuments || []
                ]
              },
              updatedAt: new Date()
            }
          }
        ],
        { new: true, runValidators: true }
      ).populate('agency');
    
      res.status(200).json({
        status:'success',
        updatedScholarship});
  })

  exports.deleteScholarship= catchAsync(async (req, res, next) => {
    // Find the review by ID
    const existingScholarship = await Scholarship.findById(req.params.id);
  
    // Check if the review exists
    if (!existingScholarship) {
      return next(new AppError('No Trips found with that ID', 404));
    }
  
    // Check if the logged-in user is the owner of the review
    if (existingScholarship.agencyId.toString() !== req.agency.id) {
      return next(new AppError('You are not authorized to delete this review', 403));
    }
    // Delete the review
    await Scholarship.findByIdAndDelete(req.params.id);
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
 exports.getAllScholarships = catchAsync(async (req, res, next) => {
    // Retrieve all scholarships
    const scholarships = await Scholarship.find().populate([
        { path: 'agencyId', select: 'name' },
        { path:'serviceType',  strictPopulate: false, select:'serviceType' }
    ]);
    res.status(200).json({
        status:'success',
        results: scholarships.length,
        data: {
          scholarships
        }
    })
 })