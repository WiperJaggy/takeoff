const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const agencyServiceController = require('../controllers/agencyServiceController')

router.get('/get-all',agencyServiceController.getAllAgencyServices);
router.get('/get-a-service/:id',agencyServiceController.getAgencyService);
router.use(authController.protect);

module.exports = router;