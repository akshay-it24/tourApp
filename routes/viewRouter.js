const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');
const router = express.Router();

router.get('/forgotPassword', viewController.getForgotEmail);
router.get('/resetPassword/:resetToken', viewController.resetPassword);
router.get('/signup', viewController.getSignup);
router.get('/me', authController.protect, viewController.getAccount);
router.post('/submit-user-data', authController.protect, viewController.updateData);
router.get('/my-tours', authController.protect, viewController.getMyTour);

router.use(authController.isLoggedIn);
router.get('/',bookingController.createBookingCheckout ,viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLogin);



module.exports = router;