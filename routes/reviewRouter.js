const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');


const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.route('/').get(reviewController.getAllReview);
router.route('/:id').get(reviewController.getReview);
router.route('/').post(authController.restrictTo('user'), reviewController.setTourAndUserIdForcreateReview, reviewController.createReview);


router.route('/:id').delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);
router.route('/:id').patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);



module.exports = router;