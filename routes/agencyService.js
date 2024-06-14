const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

//protect all the routs after this middleware
router.use(authController.protect);
router.route('/agency-services').post()