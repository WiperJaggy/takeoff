// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('./../controllers/authController');
const agencyServiceController = require('./../controllers/agencyServiceController')
const router = express.Router();

router.use(authController.protect);
router.get('/dashboard', adminController.getAdminDashboard);
router.patch('/requests/:id',adminController.updateRequestStatus);

module.exports = router;
