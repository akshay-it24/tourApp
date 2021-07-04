const express = require('express');
const { getAllTour, createTour, getTour, updateTour, deleteTour, aliasTopTour, getTourStates, getMonthlyPlan, getTourWithIn, getDistance, uploadTourImages, resizeTourImage } = require('./../controller/tourController');
const router = express.Router();
const authController = require('./../controller/authController');
// const reviewController = require('./../controller/reviewController')
const reviewRouter = require('./reviewRouter');

// router.param('id', checkId);
// router.route("/").get(getAllTour).post(checkBody, createTour);


router.use('/:tourId/reviews', reviewRouter);

// router.route().post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
router.route('/top-5-cheap').get(aliasTopTour, getAllTour);
router.route('/tour-states').get(getTourStates);

router.route('/monthly-plan/:year').get(authController.restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/tour-within/:distance/center/:latlng/unit/:unit').get(getTourWithIn);
router.route('/getDistance/:latlng/unit/:unit').get(getDistance);
router.route("/").get(getAllTour).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), createTour);

router.route('/:id').get(getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImage, updateTour)

router.route('/:id').delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);



module.exports = router;