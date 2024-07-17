const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const authController = require('./../controllers/authController');
const carController = require('./../controllers/carController');


router.route('/').get(carController.getAllCars)

router.route('/:id').get(carController.getCar);

router.use(authController.protectAgency);

router.route('/').post(carController.createCar);
router.post('/upload-car-photo/:carId', upload.array('files', 4),carController.uploadCarPhotos)
router.route('/:id/:agencyId').patch(carController.updateCar);
router.route('/:id').delete(carController.deleteCar);
module.exports = router;