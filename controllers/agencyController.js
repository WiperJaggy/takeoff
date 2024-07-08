const AppError = require('./../utils/appError');
const Agency = require('./../models/agencyModel');
const AgencyService = require('./../models/agencyServiceModel');
const Service = require('./../models/serviceModel');
const catchAsync = require('./../utils/catchAsync')
const AgencyRequest = require('./../models/agencyRequestModel');
const Booking = require('./../models/bookingModel');

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