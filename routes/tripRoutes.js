const express = require('express');
const router = express.Router();

const tripController = require('../controllers/tripController');
const authController = require('./../controllers/authController');


router.route('/').get(tripController.getAllTrips);

router.use(authController.protectAgency);
router.route('/').post(tripController.createTrip).get(tripController.getAllTrips);

module.exports = router;