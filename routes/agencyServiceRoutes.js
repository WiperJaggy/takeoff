const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const agencyServiceController = require('../controllers/agencyServiceController')
router.route('/:id').get(agencyServiceController.getAgencyService);
//protect all the routs after this middleware
router.use(authController.protect);
router.get('/get-all-agencies-services',agencyServiceController.getAllAgencyServices);

module.exports = router;
