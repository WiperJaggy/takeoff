const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const scholarshipController = require('./../controllers/scholarshipContoller');

router.route('/').get(scholarshipController.getAllScholarships);
router.route('/:id').get(scholarshipController.getScholarship);
router.use(authController.protectAgency);

router.route('/').post(scholarshipController.createScholarship);
router.route('/:id/:agencyId').patch(scholarshipController.updateScholarship);
router.route('/:id').delete(scholarshipController.deleteScholarship);
module.exports = router;