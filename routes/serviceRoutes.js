const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');
const serviceController = require('./../controllers/serviceController');
const agencyServiceController = require('./../controllers/agencyServiceController')
const router = express.Router();
router.get('/', serviceController.getAllServices);

router.use(authController.protect);
router.post('/add-new-service',authController.restrictTo('admin'),serviceController.addService);
router.delete('/delete-service/:id',authController.restrictTo('admin'), serviceController.deleteService);

module.exports = router;
