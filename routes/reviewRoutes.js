const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController') 

router.use(authController.protect)
router.route('/').get(reviewController.getAllReviews);
router.route('/add-review/:id').post( reviewController.createReview);
router.route('/delete-review/:id').delete(reviewController.deleteReview);
router.route('/update-review/:id').patch(reviewController.updateReview);

//router.route('/:id').get(reviewController.getreview).delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
module.exports = router;