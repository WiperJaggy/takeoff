const AgencyService = require('../models/agencyServiceModel');
const Booking = require('../models/bookingModel');
const Payment = require('./../models/paymentModel');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel')
// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Find the booking by ID
  const booking = await Booking.findById(req.body.bookingId)
    .populate('serviceId','id')
    .populate('user', 'email');

  console.log('Booking:', booking);
  if (!booking) {
    return next(new Error('Invalid booking ID'));
  }

  if (!booking.serviceId || !booking.user) {
    return next(new Error('Missing service or user information in the booking'));
  }
if(booking.status === 'cancelled' || 'returned' || 'confirmed'){
  return next(new Error('Booking is cancelled or returned'))
}
else if(booking.status === 'confirmed'){
  return next(new Error('Booking is already confirmed'))
}
  // Create a Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.PAYMENT_URL}/payment/checkout-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}&userId=${req.user.id}`,
    cancel_url: `${process.env.PAYMENT_URL}/booking/${booking._id}`,
    customer_email: booking.user.email,
    client_reference_id: booking.serviceId.toString(),
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: booking.bookingType,
            images: [],
          },
          unit_amount: booking.totalPrice * 100,
        },
        quantity: 1,
      },
    ],
  });
  const sessionId = session.id;
  res.status(200).json({
    status: 'success',
    session,
  });
});


exports.checkoutSuccess = catchAsync(async (req, res,next) => {
  const bookingId = req.query.bookingId;
  const booking = await Booking.findById(bookingId);
  const userId = req.query.userId;
    // Verify the user's authentication
    const user = await User.findById(userId);
    if (!user) {
      return next(new Error('Invalid user ID'));
    }

  if (!booking) {
    return next(new Error('Invalid booking ID'));
  }

  // Update the booking and payment statuses
  booking.status = 'confirmed';
  const sessionId = req.query.session_id;
  const payment = await Payment.create({
    booking: booking._id,
    user:booking.user,
    amount: booking.totalPrice,
    status: 'paid',
    transactionId: sessionId,
  });

  await booking.save();
  await payment.save();
res.status(200).json({booking ,payment,user})
});


exports.checkoutCancel = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new Error('Invalid booking ID'));
  }

  // Render the booking page with a message
res.status(200).json({
  status:"success",
  booking,
  message:" payment has been cancelled."
})
});
// app.post('/create-checkout-session', async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//         price: '200',
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `${process.env.PAYMENT_URL}/checkout-success`,
//     cancel_url: `${process.env.PAYMENT_URL}/booking`,
//   });

//   res.redirect(303, session.url);
// });

// app.listen(4242, () => console.log('Running on port 4242'));