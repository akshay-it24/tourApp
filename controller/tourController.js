const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handleFactory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImage = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) {
        return next();
    }

    // for coverImage
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // for images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );
    next();
})


exports.getAllTour = handleFactory.getAll(Tour);
exports.getTour = handleFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = handleFactory.createOne(Tour);
exports.deleteTour = handleFactory.deleteOne(Tour);
exports.updateTour = handleFactory.updateOne(Tour);

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,summary,description,difficulty";
    next();
}

exports.getTourStates = catchAsync(async (req, res, next) => {
    const states = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: "$difficulty" },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' },
                avgPrice: { $avg: '$price' },
                avgRating: { $avg: '$ratingsAverage' },
                numRating: { $sum: '$ratingsQuantity' },
                numTour: { $sum: 1 }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     // $match: { _id: { $ne: 'EASY' } }
        // }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            states
        }
    })
    // try {

    // }
    // catch (err) {
    //     res.status(400).json({
    //         status: "fail",
    //         data: "invalid data sent"
    //     });
    // }
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }

    ]);
    res.status(200).json({
        status: "success",
        length: plan.length,
        data: {
            plan
        }
    })
    // try {

    // }
    // catch (err) {
    //     res.status(400).json({
    //         status: "fail",
    //         data: "invalid data sent"
    //     });
    // }
})

exports.getTourWithIn = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    // console.log(latlng);
    const [lat, lag] = latlng.split(",");

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lag) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    const tour = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lag, lat], radius] } }
    })

    res.status(200).json({
        status: 'success',
        length: tour.length,
        data: {
            tour
        }
    })
});

exports.getDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    // console.log(unit);
    const [lat, lag] = latlng.split(",");

    const multiply = unit === "mi" ? 0.000621371 : 0.001;

    if (!lat || !lag) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lag * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiply
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    // const distances =await Tour.aggregate([

    // ])
    res.status(200).json({
        status: 'success',
        length: distances.length,
        data: {
            distances
        }
    })
})