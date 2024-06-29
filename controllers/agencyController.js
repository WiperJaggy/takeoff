const AppError = require('./../utils/appError');
const Agency = require('./../models/agencyModel');
const AgencyService = require('./../models/agencyServiceModel');
const Service = require('./../models/serviceModel');
const catchAsync = require('./../utils/catchAsync')
const AgencyRequest = require('./../models/agencyRequestModel');
const Booking = require('./../models/bookingModel');
// agency.controller.js

exports.createAgencyRequest = async (req, res) => {
    try {
      // Assuming you already have the agency document created
      const agency = req.body;
  
      if (!agency) {
        return res.status(404).json({
          status: 'fail',
          message: 'Agency not found'
        });
      }
  
      // Create a new AgencyRequest document
      const agencyRequest = await AgencyRequest.create({
        agencyId: agency._id,
        lissenceCopy: req.body.lissenceCopy
      });
  
      res.status(201).json({
        status: 'success',
        data: {
          agencyRequest
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  };

  // Agency controller
exports.getAgencyBookings = async (req, res, next) => {
  const bookings = await Booking.find({ service: { $in: req.agency.services } }).populate('service');
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
};