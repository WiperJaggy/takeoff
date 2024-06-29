// controllers/adminController.js
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const AgencyRequest = require('./../models/agencyRequestModel');
const Agency = require('./../models/agencyModel');
const Service = require('./../models/serviceModel');

exports.getAdminDashboard = catchAsync(async (req, res, next) => {
    // Check if the user is authenticated and has the role of admin
    if (req.user && req.user.role === 'admin') {
      // Fetch all agency requests
      const requests = await AgencyRequest.find({});
      // Send the data as a JSON response
      res.status(200).json({
        status: 'success',
        data: { requests },
      });
    } else {
      return next(new AppError('You are not authorized to access this resource', 403));
    }0
  });

exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  // Check if the user is authenticated and has the role of admin
  if (req.user && req.user.role === 'admin') {
    const requestId = req.params.id;
    const { status, adminResponse } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return next(new AppError('Invalid status value. The status must be one of: pending, approved, or rejected.', 400));
      }
    // Update the agency request document with the new status and admin response
    const updatedRequest = await AgencyRequest.findByIdAndUpdate(
      requestId,
      { status, adminResponse,updatedAt: Date.now() },
      { new: true }
    );

    // Send a success response
    res.status(200).json({
      status: 'success',
      data: { request: updatedRequest },
    });
  } else {
    return next(new AppError('You are not authorized to access this resource', 403));
  }
});