const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const flightController = require('./../controllers/flightController');

router.route('/').get(flightController.getAllFlights);
router.route('/:id').get(flightController.getFlight);
router.use(authController.protectAgency);

router.route('/').post( authController.checkAgencyStatus,flightController.createFlight);
router.route('/:id/:agencyId').patch(authController.checkAgencyStatus,flightController.updateFlight);
router.route('/:id').delete(authController.checkAgencyStatus,flightController.deleteFlight);
module.exports = router;