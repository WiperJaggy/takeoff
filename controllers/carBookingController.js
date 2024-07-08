const User = require('./../models/userModel')
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const carBooking = require('./../models/carBooking');
const Car = require('./../models/carModel');

exports.createCarBooking = catchAsync(async(req, res, next) => {
    const user = req.user.id;
    const { id: carId } = req.params;
    const { drivingLicenceId, drivingLicenceType, bloodType, startDate, endDate } = req.body;

    // Check if user exists in the database
    const existingUser = await User.findById(user);
    if (!existingUser) {
        return next(new AppError('No user found with that ID', 404));
    }

    // Check if car exists in the database
    const existingCar = await Car.findById(carId);
    if (!existingCar) {
        return next(new AppError('No car found with that ID', 404));
    }

    // Create a new car booking
    const newCarBooking = await carBooking.create({
        user: user,
        car: carId,
        drivingLicenceId: drivingLicenceId,
        drivingLicenceType: drivingLicenceType,
        bloodType: bloodType,
        startDate: startDate,
        endDate: endDate
    });
    const populatedcarBooking = await newCarBooking.populate([
        { path: 'user', select: 'userName email' },
        { path: 'car',  strictPopulate: false  }
      ]);

    res.status(201).json({
        status: 'success',
        data: {
            carBooking: populatedcarBooking
        }
    });
});