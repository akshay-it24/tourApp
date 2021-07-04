const express = require('express');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');
const router = express.Router();

router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.get('/book-tour', bookingController.createBookingCheckout);
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBooking);

router.use(authController.restrictTo('admin lead-guide'));
router.get('/:id', bookingController.getBooking);
router.delete('/:id', bookingController.deleteBooking);
router.patch('/:id', bookingController.updateBooking);

module.exports = router;