const Tour = require('./../models/tourModels');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModels');

exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();
    if (!tours) {
        return next(new AppError('Tour is not found', 404))
    }
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLogin = (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    })
}

exports.getSignup = (req, res, next) => {
    res.status(200).render('signUp', {
        title: 'Sign up your account',
    })
}

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
}

exports.getMyTour = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });

    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
})

exports.updateData = catchAsync(async (req, res, next) => {
    console.log(req.body.name);
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
})

exports.getForgotEmail = (req, res, next) => {
    res.status(200).render('forgotPassword', {
        title: 'forgot Password'
    })
}

exports.resetPassword = (req, res, next) => {
    res.status(200).render('resetPasswordData', {
        title: 'reset password',
        data: {
            resetToken: req.params.resetToken
        }
    })
}