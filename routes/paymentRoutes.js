const express = require('express');
const authController = require('./../controllers/authController');
const paymentController = require('./../controllers/paymentController')
const router = express.Router();
router.use(authController.protect)
router.route('/create-checkout-session/').get(paymentController.getCheckoutSession)
router.route('/checkout-success').get(paymentController.checkoutSuccess)
router.route('/cancel-payment',paymentController.checkoutCancel)
module.exports = router;