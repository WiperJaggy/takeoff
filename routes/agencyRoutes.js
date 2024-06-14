const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const agencyController= require('./../controllers/agencyController');
const agencyServiceController = require('./../controllers/agencyServiceController')
//protect all the routs after this middleware
router.use(authController.protectAgency);
router.route('/add-services').post(agencyServiceController.createService);

module.exports = router;
