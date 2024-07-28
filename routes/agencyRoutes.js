const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const agencyController= require('./../controllers/agencyController');
const agencyServiceController = require('./../controllers/agencyServiceController')
const upload = require('../config/multer');
//protect all the routs after this middleware
router.use(authController.protectAgency);
router.route('/get-service-bookings/:serviceType').get(agencyController.getBookingsByServiceType);
router.route('/get-bookings/:serviceId').get(agencyController.getBookingsByServiceId)
router.route('/upload-agency-photo').post(authController.checkAgencyStatus, upload.single('file'),agencyController.uploadAgencyPhoto);
router.route('/').get(agencyServiceController.getAgencyServices);
router.route('/:id').get(agencyServiceController.getMyService);
router.route('/add-services').post(authController.checkAgencyStatus,agencyServiceController.createService);
router.route('/update-a-service/:id').patch(authController.checkAgencyStatus,agencyServiceController.updateService);
router.route('/delete-a-service/:id').delete(authController.checkAgencyStatus,agencyServiceController.deleteAgencyService);
module.exports = router;
