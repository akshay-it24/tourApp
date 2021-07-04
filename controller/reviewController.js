const Review = require('./../models/reviewModels');
const catchAsync = require('./../utils/catchAsync');
const handleFactory = require('./handleFactory');

exports.getAllReview = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const allReview = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        data: allReview
    })
})

exports.setTourAndUserIdForcreateReview = (req, res, next) => {
    if (!req.body.tour) {
        req.body.tour = req.params.tourId;
    }
    if (!req.body.user) {
        req.body.user = req.user.id;
    }
    next();
}

exports.getAllReview = handleFactory.getAll(Review);
exports.getReview = handleFactory.getOne(Review);
exports.createReview = handleFactory.createOne(Review);
exports.deleteReview = handleFactory.deleteOne(Review);
exports.updateReview = handleFactory.updateOne(Review);