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
const uploadImages =require('./../utils/uploadFiles');

exports.createBooking = catchAsync(async(req,res,next)=>{
  const {details} = req.body;
  const  {serviceType} = req.params;
  const serviceId = details.serviceId;
  
  console.log(serviceType, serviceId);
  let service ;
  let agencyId;
  switch (serviceType) {
    case 'car':
        service = await Car.findById(serviceId);
        if (!service) {
          return res.status(404).json({ msg: 'Car not found' });
        }
        agencyId = service.agencyId;
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
       // Check if the dates are valid
       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ msg: 'Invalid start or end date format' });
      }
   // Calculate the duration between start and end dates in days
   const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
   console.log(durationInDays);
   const now = new Date();
  totalPrice = service.price * (1 - (service.priceDiscount / 100)) * durationInDays;
      if (startDate < now || endDate < now) {
          return res.status(400).json({ msg: 'Start date or end date cannot be in the past' });
      }
      if (endDate < startDate) {
          return res.status(400).json({ msg: 'End date cannot be before start date' });
      }
     
        break;
    case 'flight':
        service = await Flight.findById(serviceId);
        if (!service) {
          return res.status(404).json({ msg: 'Flight not found' });
        }
        agencyId = service.agencyId;


        const peopleNumber = details.people.length;
        if (peopleNumber > service.availableSeats) {
          return res.status(400).json({ msg: 'Not enough available seats for the requested number of people' });
        }
      
        const ids = new Set();
        const duplicatedIdentifiers = new Set();
      
        for (const person of details.people) {
          if (!/^[a-zA-Z\s]+$/.test(person.firstName)) {
            return res.status(400).json({ msg: 'Full name must contain only letters and spaces' });
          }
          if (!/^[a-zA-Z\s]+$/.test(person.lastName)) {
            return res.status(400).json({ msg: 'Full name must contain only letters and spaces' });
          }
          if (typeof person.age !== 'number' || person.age < 1 || person.age > 100) {
            return res.status(400).json({ msg: 'Age must be a number between 1 and 100' });
          }
          if (!/^\d{11}$/.test(person.identifier)) {
            return res.status(400).json({ msg: 'Identifier must be exactly 11 digits' });
          }
          if (!/^[A-Z]-\d{9}$/.test(person.passportNumber)) {
            return res.status(400).json({ msg: 'Passport number must be a capital letter followed by a hyphen and exactly 9 digits' });
          }
           // Add the passportPhoto field but do not validate it during booking creation
        person.passportPhoto = person.passportPhoto || "";
      // if (!/^https?:\/\/.+\.(jpg|jpeg|png)$/.test(person.passportPhoto)) {
      //   return res.status(400).json({ msg: 'Passport photo must be a valid URL ending with .jpg, .jpeg, or .png' });
      // }
          
          if (ids.has(person.identifier)) {
            duplicatedIdentifiers.add(person.identifier);
          } else {
            ids.add(person.identifier);
          }
        }
      
        if (duplicatedIdentifiers.size > 0) {
          return res.status(400).json({ msg: `Duplicate identifiers found within the provided people: ${Array.from(duplicatedIdentifiers).join(', ')}` });
        }

      // Check for duplicate identifiers in the database for the given trip
      const existingTripWithDuplicateIdentifiers1 = await Trip.findOne({
        _id: serviceId,
        'details.people.identifier': { $in: Array.from(ids) }
      });
      if (existingTripWithDuplicateIdentifiers1) {
        return res.status(400).json({ msg: 'One or more identifiers already exist for this trip' });
      }
    
    
      agencyId = service.agencyId;
      service.availableSeats -= peopleNumber;
      service.updatedAt = new Date();
      if (service.availableSeats < 0) {
        return res.status(400).json({ msg: 'No seats available for this trip' });
      }
      await service.save();


        break;
        case 'trip':
          service = await Trip.findById(serviceId);
          if (!service) {
            return res.status(404).json({ msg: 'Trip not found' });
          }
        
          const numPeople = details.people.length;
          if (numPeople > service.availableSeats) {
            return res.status(400).json({ msg: 'Not enough available seats for the requested number of people' });
          }
        
          const identifiers = new Set();
          const duplicateIdentifiers = new Set();
        
          for (const person of details.people) {
            if (!/^[a-zA-Z\s]+$/.test(person.fullName)) {
              return res.status(400).json({ msg: 'Full name must contain only letters and spaces' });
            }
            if (typeof person.age !== 'number' || person.age < 1 || person.age > 100) {
              return res.status(400).json({ msg: 'Age must be a number between 1 and 100' });
            }
            if (!/^\d{11}$/.test(person.identifier)) {
              return res.status(400).json({ msg: 'Identifier must be exactly 11 digits' });
            }
            if (identifiers.has(person.identifier)) {
              duplicateIdentifiers.add(person.identifier);
            } else {
              identifiers.add(person.identifier);
            }
          }
        
          if (duplicateIdentifiers.size > 0) {
            return res.status(400).json({ msg: `Duplicate identifiers found within the provided people: ${Array.from(duplicateIdentifiers).join(', ')}` });
          }
        
          // Check for duplicate identifiers in the database for the given trip
          const existingTripWithDuplicateIdentifiers = await Trip.findOne({
            _id: serviceId,
            'details.people.identifier': { $in: Array.from(identifiers) }
          });
          if (existingTripWithDuplicateIdentifiers) {
            return res.status(400).json({ msg: 'One or more identifiers already exist for this trip' });
          }
        
        
          agencyId = service.agencyId;
          service.availableSeats -= numPeople;
          service.updatedAt = new Date();
          if (service.availableSeats < 0) {
            return res.status(400).json({ msg: 'No seats available for this trip' });
          }
          await service.save();
        
          break;        
        
    case 'scholarship':
        service = await Scholarship.findById(serviceId);
        if (!service) {
          return res.status(404).json({ msg: 'Flight not found' });
        }
        agencyId = service.agencyId;
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
if(serviceType === 'car'){
  const conflictingBookings = await Booking.find({
    serviceId,
    bookingType: 'car',
    $or: [
      { 'details.startDate': { $lt: details.endDate, $gt: details.startDate } },
      { 'details.endDate': { $lt: details.endDate, $gt: details.startDate } },
      { 'details.startDate': { $lte: details.startDate }, 'details.endDate': { $gte: details.endDate } }
    ]
  });
  
  if (conflictingBookings.length > 0) {
    return res.status(400).json({ msg: 'Car is already booked for the specified date range' });
  }
}


details.agencyId = agencyId;
const booking = new Booking({
  user: req.user.id,
  bookingType: serviceType,
  serviceId,
  agencyId,
  totalPrice: totalPrice,
  details
});
await booking.save();
res.status(201).json({
  booking
})
})
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const {userId} = req.params
  const bookings = await Booking.find({ user:userId});

  // Check if the current user is the same as the user who booked the car
  if (bookings.some(booking => booking.user.toString() !== req.user.id)) {
    return next(new AppError('You are not authorized to return this booking', 403));
  }

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});
exports.getUserBooking = catchAsync(async (req, res, next) => {
  const { userId, bookingId } = req.body;

  try {
    // Find the booking by ID and user
    const booking = await Booking.findOne({ _id: bookingId, user: userId });

    // Check if the booking exists and if the current user is the owner
    if (!booking || booking.user.toString() !== req.user.id) {
      return next(new AppError('Booking not found or you are not authorized to view this booking', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    next(err);
  }
});

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
  if(booking.status === 'cancelled' || booking.status === 'confirmed'){
    return res.status(403).json({ message: 'Cannot cancel a cancelled or confirmed booking' });
  }
  if (booking.status === 'pending payment'){
    if (booking.bookingType==='trip' ){
      const trip = await Trip.findById(booking.details.serviceId);
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
  
      // Update the availableSeats
      const numPeople = booking.details.people.length;
      trip.availableSeats += numPeople;
      trip.updatedAt = new Date();
      await trip.save();
    }else if(booking.bookingType ==='flight'){
      const flight = await Flight.findById(booking.details.serviceId);
      if (!flight) {
        return res.status(404).json({ message: 'flight not found' });
      }
  
      // Update the availableSeats
      const numPeople = booking.details.people.length;
      flight.availableSeats += numPeople;
      flight.updatedAt = new Date();
      await flight.save();
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({ message: 'Booking cancelled successfully' });
  }

})



exports.uploadPassportPhotos = catchAsync(async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const files = req.files;

    console.log('Received request to upload passport photos');
    console.log('Booking ID:', bookingId);
    console.log('Files:', files);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', booking);

    const people = booking.details.people;

    console.log('People in booking:', people);

    if (files.length !== people.length) {
      return res.status(400).json({ message: 'Number of photos does not match the number of people' });
    }

    for (let i = 0; i < people.length; i++) {
      const file = files[i];
      console.log('Processing file for person:', people[i]);
      const photoUrl = await uploadImages(file);
      console.log('Photo URL:', photoUrl);
      people[i].passportPhoto = photoUrl;
    }

    // Prevent `createdAt` from being updated
    booking.markModified('details.people');
    await booking.save();

    console.log('Booking updated successfully');

    return res.status(200).json({ message: 'Passport photos uploaded successfully', people });
  } catch (error) {
    console.error('Error uploading passport photos:', error);
    return res.status(500).json({ message: 'Error uploading passport photos', error: error.message });
  }
});
