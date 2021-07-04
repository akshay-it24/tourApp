const Tour = require('./../models/tourModels');
const Booking = require('./../models/bookingModels');
const Stripe = require('stripe');
const catchAsync = require('./../utils/catchAsync');
const handlefactory = require('./handleFactory');

const stripe = Stripe('sk_test_51IRv3EJUYMHHOLOsfHD0pKH83LlykiPoSVsUbrXJaHnolGsukIgh8rANqqvYVIwTskoaqVkNUtYioCZ64BVtM6K000itzZhN5V');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);

})

exports.createBooking = handlefactory.createOne(Booking);
exports.getAllBooking = handlefactory.getAll(Booking);
exports.getBooking = handlefactory.getOne(Booking);
exports.deleteBooking = handlefactory.deleteOne(Booking);
exports.updateBooking = handlefactory.updateOne(Booking);