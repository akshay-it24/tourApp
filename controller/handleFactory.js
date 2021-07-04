const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const query = Model.find(filter);
    const features = new APIFeatures(query, req.query).filter().sorting().limitFields().paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();
    res.status(200).json({
        status: "success",
        requestTime: req.requestTime,
        length: doc.length,
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
        return next(new AppError("document not found", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: doc
    })
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError("document not found", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError("document not found", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    })
})

