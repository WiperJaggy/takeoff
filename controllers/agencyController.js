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

exports.getBookingsByServiceType = catchAsync(async (req, res, next) => {
  const { serviceType } = req.params;
  const { id: agencyId } = req.agency;

console.log(serviceType, agencyId)
  // Validate service type
  const validServiceTypes = ['car', 'flight', 'trip', 'scholarship'];
  if (!validServiceTypes.includes(serviceType)) {
    return res.status(400).json({ msg: 'Invalid service type' });
  }
 // Convert the serviceId and agencyId to ObjectId
 const agencyObjectId =  new mongoose.Types.ObjectId(agencyId);
  // Fetch bookings for the given service type and agency
  const bookings = await Booking.find({
    'details.agencyId': agencyObjectId,
    bookingType: serviceType
  });

  res.status(200).json({
    message:'success',
    results :bookings.length,
    bookings });
});

exports.getBookingsByServiceId = catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;
  const { id: agencyId } = req.agency;

  console.log('Agency ID:', agencyId, 'Service ID:', serviceId);

  try {
    // Convert the serviceId and agencyId to ObjectId
    const agencyObjectId =  new mongoose.Types.ObjectId(agencyId);

    // Fetch bookings for the given service ID and agency
    const bookings = await Booking.find({
      'details.agencyId': agencyObjectId,
      serviceId: serviceId
    });

    // Check if any bookings were found
    if (bookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this service ID' });
    }

    res.status(200).json({
      message:'success',
        results :bookings.length,
      bookings });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ msg: 'Error fetching bookings' });
  }
});


  // // Calculate the license expiry date
  // const licenseExpiryDate = new Date();
  // licenseExpiryDate.setFullYear(licenseExpiryDate.getFullYear() + 1);
