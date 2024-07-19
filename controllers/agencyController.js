const AppError = require('./../utils/appError');
const Agency = require('./../models/agencyModel');
const AgencyService = require('./../models/agencyServiceModel');
const Service = require('./../models/serviceModel');
const catchAsync = require('./../utils/catchAsync')
const AgencyRequest = require('./../models/agencyRequestModel');
const Booking = require('./../models/bookingModel');
const uploadImage = require('./../utils/uploadFiles');

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
exports.uploadAgencyPhoto = catchAsync(async (req, res, next) => {
  console.log('Request:', req.file);
  try {
    const publicUrl = await uploadImage(req.file);

    // Store the public URL in the database
    const agency = await Agency.findById(req.agency.id);
    agency.photo = publicUrl;
    await agency.save({ validateBeforeSave: false, runValidators: false });

    res.status(200).send({ fileUrl: publicUrl });
  } catch (error) {
    console.log('Error:', error);
    next(error);
  }
});