const express = require('express');
const authController = require('./../controllers/authController');
const agencyServiceController = require('./../controllers/agencyServiceController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();
router.use(authController.protect)
router.route('/create-a-booking').post(bookingController.createBooking)
module.exports = router;
