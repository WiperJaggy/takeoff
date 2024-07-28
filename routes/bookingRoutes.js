const express = require('express');
const authController = require('./../controllers/authController');
const agencyServiceController = require('./../controllers/agencyServiceController');
const bookingController = require('./../controllers/bookingController');
const upload = require('../config/multer');
const router = express.Router();

router.use(authController.protect)
router.route('/create-a-booking/:serviceType/').post( bookingController.createBooking)
router.patch('/upload-documents/:bookingId', upload.array('files',5), bookingController.uploadScholarshipDocuments)
router.get('/get-all-my-bookings',bookingController.getUserBookings)
router.get('/get-my-booking',bookingController.getUserBooking)
router.get('/cancel-booking',bookingController.cancelBooking)
router.post('/uploadPassportPhotos/:bookingId', upload.array('photos'), bookingController.uploadPassportPhotos);
module.exports = router;
