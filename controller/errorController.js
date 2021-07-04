const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
    const value = err.keyValue.name;
    const message = `Duplicate field value:${value} . Please use another value!`;
    return new AppError(message, 400);
}

const handleValidatorErrorDB = err => {
    const msg = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data ${msg.join('. ')}`
    return new AppError(message, 400);
}

const handleJsonWebTokenError = () => {
    return new AppError("You are not logged in please logged in", 401);
}

const handleTokenExpiredError = () => {
    return new AppError("Token is expire Please logged in again ", 401);
}

const sendErrDev = (err, req, res) => {
    console.log(err);
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        })
    }
    res.status(err.statusCode).render('error', {
        'title': 'something went wrong!',
        'msg': err.message
    })
}

const sendErrProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }

        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
}

module.exports = (err, req, res, next) => {

    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV.trim() === 'development') {
        sendErrDev(err, req, res);
    }
    else if (process.env.NODE_ENV.trim() === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldDB(error);
        }
        if (err.name === "ValidationError") {
            error = handleValidatorErrorDB(error);
        }
        if (err.name === "JsonWebTokenError") {
            error = handleJsonWebTokenError(error)
        }
        if (err.name === 'TokenExpiredError') {
            error = handleTokenExpiredError(error);
        }
        sendErrProd(error, req, res);
    }
}  