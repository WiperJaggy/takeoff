const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const AgencyService = require('./../models/agencyServiceModel')
const Service = require('./../models/serviceModel')
const Payment = require('./../models/paymentModel');
const User = require('./../models/userModel');
const Trip = require('./../models/tripModel')

// exports.createBooking = catchAsync(async (req, res, next) => {
//   const { agencyServiceId, paymentMethod, people } = req.body;

//   // Check if user exists in the database
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return res.status(400).json({ message: 'User not found. Please sign up before creating a booking.' });
//   }

//   // Validate user information
//   if (req.body.firstName !== user.profile.firstName) {
//     return res.status(400).json({ message: 'First name provided does not match the registered first name.' });
//   }

//   if (req.body.lastName !== user.profile.lastName) {
//     return res.status(400).json({ message: 'Last name provided does not match the registered last name.' });
//   }

//   if (req.body.email !== user.email) {
//     return res.status(400).json({ message: 'Email provided does not match the registered email.' });
//   }

//   const agencyService = await AgencyService.findById(agencyServiceId);
//   if (!agencyService) {
//     return res.status(404).json({ error: 'Agency service not found' });
//   }

//   if (agencyService.available !== true) {
//     return next(new AppError('This service is not available', 404));
//   }
//   const numPeople = parseInt(people.length);
//   const totalPrice = agencyService.price * (1 - (agencyService.discountPercentage / 100)) * numPeople ;

//   const booking = await Booking.create({
//     user: user._id,
//     service: agencyServiceId,
//     totalPrice: totalPrice,
//     numPeople,
//     people
//   });

//   res.status(200).json({ booking });
// });

exports.createBooking = catchAsync(async (req, res, next) => {
  const { agencyServiceId, paymentMethod, people } = req.body;

  // Check if user exists in the database
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: 'User not found. Please sign up before creating a booking.' });
  }

  // Validate user information
  if (req.body.firstName !== user.profile.firstName) {
    return res.status(400).json({ message: 'First name provided does not match the registered first name.' });
  }

  if (req.body.lastName !== user.profile.lastName) {
    return res.status(400).json({ message: 'Last name provided does not match the registered last name.' });
  }

  if (req.body.email !== user.email) {
    return res.status(400).json({ message: 'Email provided does not match the registered email.' });
  }

  const agencyService = await AgencyService.findById(agencyServiceId);
  if (!agencyService) {
    return res.status(404).json({ error: 'Agency service not found' });
  }

  if (agencyService.available !== true) {
    return next(new AppError('This service is not available', 404));
  }

  const serviceType = await Service.findById(agencyService.serviceType);
  if (!serviceType) {
    return res.status(404).json({ error: 'Service type not found' });
  }

  // Handle different service types
  let bookingData = {
    user: user._id,
    service: agencyServiceId,
    totalPrice: totalPrice,
    numPeople,
    people
  };

  switch (serviceType.name) {
    case 'trips':
      const trip = await Trip.findById(agenc)
      bookingData.tripDetails = {
        // Add trip-specific attributes here
        
      };
      break;
    case 'Car Rental':
      bookingData.carRentalDetails = {
        // Add car rental-specific attributes here
      };
      break;
    // Add more cases for other service types
    default:
      return next(new AppError('Invalid service type', 404));
  }

  const numPeople = parseInt(people.length);
  const totalPrice = agencyService.price * (1 - (agencyService.discountPercentage / 100)) * numPeople;
  bookingData.totalPrice = totalPrice;

  const booking = await Booking.create(bookingData);

  res.status(200).json({ booking });
});












    1
  exports.getUserBookings = async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).populate('service');
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  };