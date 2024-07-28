const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const scholarshipController = require('./../controllers/scholarshipContoller');

router.route('/').get(scholarshipController.getAllScholarships);
router.route('/:id').get(scholarshipController.getScholarship);
router.use(authController.protectAgency);

router.route('/').post(authController.checkAgencyStatus,scholarshipController.createScholarship);
router.route('/:id/:agencyId').patch(authController.checkAgencyStatus,scholarshipController.updateScholarship);
router.route('/:id').delete(authController.checkAgencyStatus,scholarshipController.deleteScholarship);
module.exports = router;