const mongoose = require('mongoose');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// reviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'tour',
//         select: 'name'
//     }).populate({
//         path: 'user',
//         select: 'name photo'
//     })
//     next();
// })

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

reviewSchema.statics.calAverageValue = async function (tourId) {

    const state = await this.aggregate([

        {
            $match: {
                tour: tourId
            }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (state.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: state[0].nRating,
            ratingsAverage: state[0].avgRating
        })
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

}

reviewSchema.post('save', function () {
    this.constructor.calAverageValue(this.tour);
})

//for update and delete review

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    // console.log(this.r);
    // console.log(this.r.tour);
    await this.r.constructor.calAverageValue(this.r.tour)
})



const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
