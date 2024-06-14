const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const agencyService = require('./../models/agencyServiceModel');

exports.createService = catchAsync(async (req, res, next) => {
  const agencyId = req.agency.id;
  // Assuming the authenticated user's id is available as `req.user.id`

  const service = await Service.create({
    serviceName: req.body.serviceName,
    description: req.body.description,
    agencyId,
  });

  if (!service) {
    return next(new AppError('there was an error adding the service', 400));
  }

  // Create a new agencyServices document
  const newAgencyService = await agencyService.create({
    agencyId,
    serviceId: service._id,
    licenseExpiryDate: req.body.licenseExpiryDate,
  });

  res.status(201).json({ service, agencyService: newAgencyService });
});