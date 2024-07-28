const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const authController = require('./../controllers/authController');
const carController = require('./../controllers/carController');


router.route('/').get(carController.getAllCars)

router.route('/:id').get(carController.getCar);

router.use(authController.protectAgency);

router.route('/').post(authController.checkAgencyStatus,carController.createCar);
router.post('/upload-car-photo/:carId',authController.checkAgencyStatus, upload.array('files', 4),carController.uploadCarPhotos)
router.route('/:id/:agencyId').patch(authController.checkAgencyStatus,carController.updateCar);
router.route('/:id').delete(authController.checkAgencyStatus,carController.deleteCar);
module.exports = router;