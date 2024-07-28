// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('./../controllers/authController');
const agencyServiceController = require('./../controllers/agencyServiceController')
const router = express.Router();

router.use(authController.protect);
router.patch('/enable-agency',adminController.enableAgency);
router.patch('/disable-agency',adminController.disableAgency);
router.get('/dashboard', adminController.getAdminDashboard);
router.get('/dashboard/:id',authController.restrictTo('admin'), adminController.getAgnecyRequest);
router.patch('/requests/:id',adminController.updateRequestStatus);
//router.get('/get-weekly-report/:id',adminController.getWeeklyReport)
module.exports = router;
