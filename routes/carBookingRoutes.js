const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const carBookingController = require('./../controllers/carBookingController');

router.use(authController.protect)
router.route('/create-car-booking/:id').post(carBookingController.createCarBooking)

module.exports = router;
