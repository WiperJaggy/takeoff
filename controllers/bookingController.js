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
const uploadFile =require('./../utils/uploadFiles');
// exports.createBooking = catchAsync(async (req, res, next) => {
//   const {agencyServiceId} = req.params;
//   const {theServiceId}=req.query;
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

//   const serviceType = await Service.findById(agencyService.serviceType);
//   if (!serviceType) {
//     return res.status(404).json({ error: 'Service type not found' });
//   }

//   // Handle different service types
//   let bookingData = {
//     user: user._id,
//     service: agencyServiceId,
//     totalPrice: totalPrice,
//   };

//   switch (serviceType.name) {
//     case 'trips':
//       const trip = await Trip.findById(theServiceId)
//       bookingData.tripDetails = {
//         numPeople: req.body.numPeople,
//         people: req.body.people
//       };
//       break;
//     case 'car rental':
//       const car = await Car.findById(theServiceId)
//       bookingData.carRentalDetails = {
//         drivingLicenceId: {
//           type: Number,
//           required: true
//         },
//         bloodType: {
//           type: String,
//           required: true,
//           enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
//         },
//         drivingLicenceType: {
//           type: String,
//           required: true,
//           enum: ['private', 'public']
//         },
//         drivingLicenceExpiryDate: {
//           type: Date,
//           required: true
//         },
//         startDate: {
//           type: Date,
//           required: true
//         },
//         endDate: {
//           type: Date,
//           required: true
//         }
//       };

//       // Set the car availability to false for the booking duration
//       car.available = false;
//       car.startDate = bookingData.carRentalDetails.startDate;
//       car.endDate = bookingData.carRentalDetails.endDate;
//       await car.save();
  
//       break;
//       case 'flights':
//         const flight = await Flight.findById(theServiceId)
//         bookingData.flightsDetails = {
//           numPeople: req.body.numPeople,
//           people: req.body.people,
//           passportNumber:{
//             type: Number,
//             required:true
//           },
//           passportExpiryDate:{
//             type: Date,
//             required:true
//           },
//           passportPhoto:{
//             type: String
//           }
//         };
//         break;
//         case 'scholarships':
//           const scholarship = await Scholarship.findById(theServiceId)
//           bookingData.scholarships = {
//             passportNumber: {
//               type: Number,
//               required: true
//             },
//             passportExpiryDate: {
//               type: Date,
//               required: true
//             },
//             passportPhoto: {
//               type: [String], // Array of file paths
//               required: true
//             },
//             recommendationLetters: {
//               type: [String], // Array of file paths
//               required: true
//             },
//             cv: {
//               type: String, // Array of file paths
//               required: true
//             },
//             motivationLetter: {
//               type: [String], // Array of file paths
//               required: true
//             },
//             degreeCopy: {
//               type: [String], // Array of file paths
//               required: true
//             },
//             personalPhoto: {
//               type: String, // Array of file paths
//               required: true
//             },
//             languageCertificate: {
//               type: [String], // Array of file paths
//               required: true
//             }
//           };
    
//           // Handle multiple file uploads
//           await upload.fields([
//             { name: 'passportPhoto', maxCount: 1 },
//             { name: 'recommendationLetters', maxCount: 3 },
//             { name: 'cv', maxCount: 1 },
//             { name: 'motivationLetter', maxCount: 1 },
//             { name: 'degreeCopy', maxCount: 1 },
//             { name: 'personalPhoto', maxCount: 1 },
//             { name: 'languageCertificate', maxCount: 1 }
//           ])(req, res, async (err) => {
//             if (err) {
//               return next(err);
//             }
    
//             // Save the file paths to the corresponding properties
//             bookingData.scholarships.passportPhoto = req.files.passportPhoto?.[0].path;
//             bookingData.scholarships.recommendationLetters = req.files.recommendationLetters?.map(file => file.path);
//             bookingData.scholarships.cv = req.files.cv?.[0].path;
//             bookingData.scholarships.motivationLetter = req.files.motivationLetter?.[0].path;
//             bookingData.scholarships.degreeCopy = req.files.degreeCopy?.[0].path;
//             bookingData.scholarships.personalPhoto = req.files.personalPhoto?.[0].path;
//             bookingData.scholarships.languageCertificate = req.files.languageCertificate?.[0].path;
//           });
//           break;
//     // Add more cases for other service types
//     default:
//       return next(new AppError('Invalid service type', 404));
//   }
  
//   if(serviceType.name=== 'flights' || 'trips'){ 
//     const numPeople = parseInt(people.length);
//     const totalPrice = theServiceId.price * (1 - (theServiceId.priceDiscount / 100)) * numPeople;
//     bookingData.totalPrice = totalPrice;
//   }
// else if (serviceType.name=== 'scholarships' || 'car rental'){
//   const totalPrice = theServiceId.price * (1 - (theServiceId.priceDiscount / 100));
//   bookingData.totalPrice = totalPrice;
// }
// else{
// const numPeople = parseInt(people.length);
// const totalPrice = agencyService.price * (1 - (agencyService.discountPercentage / 100)) * numPeople;
// bookingData.totalPrice = totalPrice;
// }
//   const booking = await Booking.create(bookingData);

//   res.status(200).json({ 
//     status:'success',
//     booking });
// });
exports.createBooking = catchAsync(async(req,res,next)=>{
  const {details,} = req.body;
  const  {serviceType} = req.params;
  const serviceId = details.serviceId;
  
  console.log(serviceType, serviceId);
  let service ;
  switch (serviceType) {
    case 'car':
        service = await Car.findById(serviceId);
        if (!details.drivingLicenseId || !/^\d{6}$/.test(details.drivingLicenseId)) {
          return res.status(400).json({ msg: 'Invalid or missing license ID for car booking' })
      }
      if (!details.licenseType || !['private', 'public'].includes(details.licenseType)) {
          return res.status(400).json({ msg: 'Invalid or missing license type for car booking' });
      }
      if (!details.bloodType || !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(details.bloodType)) {
          return res.status(400).json({ msg: 'Invalid or missing blood type for car booking' });
      }
      if (!details.startDate || !details.endDate) {
          return res.status(400).json({ msg: 'Missing start date or end date for car booking' });
      }
      const startDate = new Date(details.startDate);
      const endDate = new Date(details.endDate);
      const now = new Date();
        // Calculate the duration between start and end dates
  const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  totalPrice = service.price * (1 - (service.priceDiscount / 100)) * durationInDays;
  details.durationInDays;
      if (startDate < now || endDate < now) {
          return res.status(400).json({ msg: 'Start date or end date cannot be in the past' });
      }
      if (endDate < startDate) {
          return res.status(400).json({ msg: 'End date cannot be before start date' });
      }
      if (!service.availability){
        return res.status(400).json({ msg: 'Car is not available for the given date range' });
      }else{
    await Car.findByIdAndUpdate(details.serviceId,{
      $set:{availability : 'false'}
    })
  }
        break;
    case 'flight':
        service = await Flight.findById(serviceId);
        break;
    case 'trip':
        service = await Trip.findById(serviceId);
        break;
    case 'scholarship':
        service = await Scholarship.findById(serviceId);
        if(!details.fullName || !details.email || !details.university ){
          return res.status(400).json({ msg: 'Missing required scholarship details' });
        }
        if (!details.degree || !['High school','Bachelor','Master','Phd'].includes(details.degree)) {
          return res.status(400).json({ msg: 'invalid or missing degree' });
      }
        break;
    default:
        return res.status(400).json({ msg: 'Invalid service type' });
}
if (!service) {
  return res.status(404).json({ msg: 'Service not found' });
}
if (serviceType === 'flight' || serviceType === 'trip') { 
  const numPeople = parseInt(details.people.length); // Use details.people instead of people
  if (!isNaN(numPeople) && numPeople > 0) {
    totalPrice = service.price * (1 - (service.priceDiscount / 100)) * numPeople;
  } else {
    totalPrice = service.price * (1 - (service.priceDiscount / 100));
  }
}
else if (serviceType === 'scholarship' ) {
  totalPrice = service.price * (1 - (service.priceDiscount / 100)) ;
}
const booking = new Booking({
  user: req.user.id,
  bookingType: serviceType,
  serviceId,
  totalPrice: totalPrice,
  details
});
await booking.save();
res.status(201).json({
  booking
})
})
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


  exports.uploadScholarshipDocuments = catchAsync(async (req, res, next) => {
    const { bookingId } = req.params;
    const documents = [];
  
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No documents uploaded' });
    }
      
    if (req.files.length > 5) {
      return res.status(400).json({ message: 'Maximum of 5 documents can be uploaded.' });
    }
   
    for (const file of req.files) {
      try {
        const docUrl = await uploadFile(file);
        console.log(docUrl)
        if (docUrl !== 'No file uploaded.' && docUrl !== 'The uploaded file is not an image.') {
          documents.push(docUrl);
        }
      } catch (err) {
        console.error('Error uploading document:', err);
        return res.status(500).json({ message: 'Error uploading document', error: err.message });
      }
    }
  
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $addToSet: { 'details.documents': { $each: documents } },
      },
      { new: true, runValidators: true }
    );
  
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
  
    res.status(200).json({ message: 'Your Documents uploaded successfully', docsUrls: documents });
  });


  exports.cancelBooking = catchAsync(async(req,res,next)=>{

    const { bookingId } = req.body;
    const { user } = req;
  
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
  
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
  
    // Check if the user who made the booking is the same as the current user
    if (booking.user.toString() !== user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });

  }
  if (booking.status === 'pending payment'){
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({ message: 'Booking cancelled successfully' });
  }

})