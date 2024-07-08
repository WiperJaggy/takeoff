const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const AgencyService = require('./../models/agencyServiceModel')
const Service = require('./../models/serviceModel')
const Payment = require('./../models/paymentModel');
const User = require('./../models/userModel');
const Trip = require('./../models/tripModel')
const Car = require('../models/carModel');
const Flight = require('../models/flightModel');
const Scholarship = require('../models/scholarshipModel');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

exports.createBooking = catchAsync(async (req, res, next) => {
  const {agencyServiceId} = req.params;
  const {theServiceId}=req.query;
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
  };

  switch (serviceType.name) {
    case 'trips':
      const trip = await Trip.findById(theServiceId)
      bookingData.tripDetails = {
        numPeople: req.body.numPeople,
        people: req.body.people
      };
      break;
    case 'car rental':
      const car = await Car.findById(theServiceId)
      bookingData.carRentalDetails = {
        drivingLicenceId: {
          type: Number,
          required: true
        },
        bloodType: {
          type: String,
          required: true,
          enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
        },
        drivingLicenceType: {
          type: String,
          required: true,
          enum: ['private', 'public']
        },
        drivingLicenceExpiryDate: {
          type: Date,
          required: true
        },
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          required: true
        }
      };

      // Set the car availability to false for the booking duration
      car.available = false;
      car.startDate = bookingData.carRentalDetails.startDate;
      car.endDate = bookingData.carRentalDetails.endDate;
      await car.save();
  
      break;
      case 'flights':
        const flight = await Flight.findById(theServiceId)
        bookingData.flightsDetails = {
          numPeople: req.body.numPeople,
          people: req.body.people,
          passportNumber:{
            type: Number,
            required:true
          },
          passportExpiryDate:{
            type: Date,
            required:true
          },
          passportPhoto:{
            type: String
          }
        };
        break;
        case 'scholarships':
          const scholarship = await Scholarship.findById(theServiceId)
          bookingData.scholarships = {
            passportNumber: {
              type: Number,
              required: true
            },
            passportExpiryDate: {
              type: Date,
              required: true
            },
            passportPhoto: {
              type: [String], // Array of file paths
              required: true
            },
            recommendationLetters: {
              type: [String], // Array of file paths
              required: true
            },
            cv: {
              type: String, // Array of file paths
              required: true
            },
            motivationLetter: {
              type: [String], // Array of file paths
              required: true
            },
            degreeCopy: {
              type: [String], // Array of file paths
              required: true
            },
            personalPhoto: {
              type: String, // Array of file paths
              required: true
            },
            languageCertificate: {
              type: [String], // Array of file paths
              required: true
            }
          };
    
          // Handle multiple file uploads
          await upload.fields([
            { name: 'passportPhoto', maxCount: 1 },
            { name: 'recommendationLetters', maxCount: 3 },
            { name: 'cv', maxCount: 1 },
            { name: 'motivationLetter', maxCount: 1 },
            { name: 'degreeCopy', maxCount: 1 },
            { name: 'personalPhoto', maxCount: 1 },
            { name: 'languageCertificate', maxCount: 1 }
          ])(req, res, async (err) => {
            if (err) {
              return next(err);
            }
    
            // Save the file paths to the corresponding properties
            bookingData.scholarships.passportPhoto = req.files.passportPhoto?.[0].path;
            bookingData.scholarships.recommendationLetters = req.files.recommendationLetters?.map(file => file.path);
            bookingData.scholarships.cv = req.files.cv?.[0].path;
            bookingData.scholarships.motivationLetter = req.files.motivationLetter?.[0].path;
            bookingData.scholarships.degreeCopy = req.files.degreeCopy?.[0].path;
            bookingData.scholarships.personalPhoto = req.files.personalPhoto?.[0].path;
            bookingData.scholarships.languageCertificate = req.files.languageCertificate?.[0].path;
          });
          break;
    // Add more cases for other service types
    default:
      return next(new AppError('Invalid service type', 404));
  }
  
  if(serviceType.name=== 'flights' || 'trips'){ 
    const numPeople = parseInt(people.length);
    const totalPrice = theServiceId.price * (1 - (theServiceId.priceDiscount / 100)) * numPeople;
    bookingData.totalPrice = totalPrice;
  }
else if (serviceType.name=== 'scholarships' || 'car rental'){
  const totalPrice = theServiceId.price * (1 - (theServiceId.priceDiscount / 100));
  bookingData.totalPrice = totalPrice;
}
else{
const numPeople = parseInt(people.length);
const totalPrice = agencyService.price * (1 - (agencyService.discountPercentage / 100)) * numPeople;
bookingData.totalPrice = totalPrice;
}
  const booking = await Booking.create(bookingData);

  res.status(200).json({ 
    status:'success',
    booking });
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