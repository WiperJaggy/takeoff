const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const carController = require('./../controllers/carController');


router.route('/').get(carController.getAllCars)

router.route('/:id').get(carController.getCar);

router.use(authController.protectAgency);

router.route('/').post( carController.createCar);
router.route('/:id/:agencyId').patch(carController.updateCar);
router.route('/:id').delete(carController.deleteCar);
module.exports = router;