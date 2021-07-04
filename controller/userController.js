const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModels');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = `${file.mimetype.split('/')[1]}`;
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not a image! please upload image', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const filterObj = (obj, ...field) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (field.includes(el)) {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    // console.log(req.file);
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

    next();
})

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("this route is not for password update! please use /updatePassword route", 400));
    }

    const userData = req.body;
    const filterUserData = filterObj(userData, 'name', 'email');
    if (req.file) {
        filterUserData.photo = req.file.filename;
    }
    const updatedData = await User.findByIdAndUpdate(req.user.id, filterUserData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        data: updatedData
    })
})



exports.deleteMe = catchAsync(async (req, res, next) => {

    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(200).json({
        status: "success",
        message: null
    })
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getOne = handleFactory.getOne(User);
exports.getAllUser = handleFactory.getAll(User);
exports.deleteUser = handleFactory.deleteOne(User);

