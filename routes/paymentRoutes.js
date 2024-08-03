const express = require('express');
const authController = require('./../controllers/authController');
const paymentController = require('./../controllers/paymentController')
const router = express.Router();
router.route('/checkout-success').get(paymentController.checkoutSuccess)
router.route('/cancel-payment/',paymentController.checkoutCancel)
router.use(authController.protect)
router.route('/create-checkout-session/').get(paymentController.getCheckoutSession)
module.exports = router;