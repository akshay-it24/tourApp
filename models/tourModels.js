
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModels');
//SCHEMA OF MODEL

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have name"],
        unique: true,
        trim: true,
        minlength: [10, "A tour name length must have more than 10 character"],
        maxlength: [40, "A tour name length must have less than 40 character"],
        // validate: [validator.isAlpha, "A tour name only contain character"]
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "A tour must have duration"],
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have max group size"]
    },
    difficulty: {
        type: String,
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Dificulty either : easy,medium,difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, "A tour rating must have max 5"],
        min: [1, "A tour rating must have min 1"],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number
    },
    price: {
        type: Number,
        required: [true, "A tour must have price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: "Discount price must have less than original price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have summary"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A tour must have description"]
    },
    imageCover: {
        type: String,
        required: [true, " A tour must have image"]
    },
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// VIRTUAL PROPERTY OF MONGOOES
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//virtual property for child ref
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
// DOCUMENT MIDDLEWARE

//PRE MIDDLEWARE OF MONGOOES WILL WORK ON SAVE AND CREATE NOT ON INSERTONE AND INSERTMANY


// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

tourSchema.pre('save', function (next) {
    // console.log("will save document");
    next();
})

//POST MIDDLEWARE OF MONGOOES
tourSchema.post('save', function (doc, next) {
    // console.log(doc.name);
    next();
})

// QUERY MIDDLEWARE 
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: 'name email role photo'
    })
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} milisecond`);
    next();
})

//AGGRIGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     // console.log(this.pipeline());
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     next();
// })

// MODEL CREATION
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;