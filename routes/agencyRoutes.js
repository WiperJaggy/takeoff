const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const agencyController= require('./../controllers/agencyController');
const agencyServiceController = require('./../controllers/agencyServiceController')
const upload = require('../config/multer');
//protect all the routs after this middleware
router.use(authController.protectAgency);
router.route('/upload-agency-photo').post( upload.single('file'),agencyController.uploadAgencyPhoto);
router.route('/').get(agencyServiceController.getAgencyServices);
router.route('/:id').get(agencyServiceController.getMyService);
router.route('/add-services').post(agencyServiceController.createService);
router.route('/update-a-service/:id').patch(agencyServiceController.updateService);
router.route('/delete-a-service/:id').delete(agencyServiceController.deleteAgencyService);
module.exports = router;
