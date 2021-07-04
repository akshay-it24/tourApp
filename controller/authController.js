const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
// const localStorage=require('node-localstorage');

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const signToken = id => {
    //sign(payload,secret_key ,option)
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })
}

const sendToken = (user, statusCode, res, req) => {
    const token = signToken(user._id);

    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        cookieOption.secure = true;
    }
    res.cookie('jwt', token, cookieOption);
    // if (typeof localStorage === "undefined" || localStorage === null) {

    // }
    localStorage.setItem("jwt", token);
    localStorage.setItem("flag", true);
    // console.log(localStorage.getItem("jwt"));
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        roles: req.body.roles
    });
    const url = `${req.protocol}://${req.get('host')}/me`
    // await new Email(newUser, url).sendWelcome();
    sendToken(newUser, 201, res, req);
});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email: email }).select('+password');
    // console.log(email);
    // console.log(password);
    if (!user) {
        return next(new AppError('Incorrect email and password', 401));
    }

    const correct = await user.correctPassword(password, user.password);
    // console.log(correct);
    if (!correct) {
        return next(new AppError("Incorrect email and password", 401));
    }
    // res.locals.user = user;
    // req.session.user = user;
    // console.log(req.session.user);
    sendToken(user, 200, res, req);

})

exports.logout = async (req, res, next) => {
    // res.cookie('jwt', 'loggedOut', {
    //     expires: new Date(Date.now() + 10 * 1000),
    //     httpOnly: true
    // })
    localStorage.removeItem("flag");
    localStorage.removeItem("jwt");
    res.status(200).json({
        status: 'success'
    })
}

exports.isLoggedIn = async (req, res, next) => {

    try {
        console.log(req.cookies.jwt);
        // 1] get token from header
        if (localStorage.getItem("flag")) {
            console.log("cookie set")
            token = localStorage.getItem("jwt");
            if (!token) {
                return next();
            }

            // 2]varify the token

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // 3] check user is still exist or not
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 4] After password change
            if (currentUser.changePasswordAfter(decoded.iat)) {
                return next();
            };

            // send data to the request header
            res.locals.user = currentUser;
            return next();
        }
    }
    catch (err) {
        next();
    }
    next();
}


exports.protect = catchAsync(async (req, res, next) => {

    // console.log(req.cookie.jwt);
    // 1] get token from header
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (localStorage.getItem("flag")) {
        token = localStorage.getItem("jwt");
    }

    if (!token) {
        return next(new AppError("you are not log in please login", 401));
    }

    // 2]varify the token

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3] check user is still exist or not
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("User belonging to this token is no longer exist", 401));
    }

    // 4] After password change
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError("User recently change password! please log in again"));
    };

    // send data to the request header
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
    // console.log("restrict");
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    if (!email) {
        return next(new AppError("Please provide email", 404));
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        return next(new AppError("user not exist with this email", 404))
    }

    // create token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //send mail to user

    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 min)',
        //     text: message
        // })

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "token sent to email"
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {

    const resetToken = req.params.token;
    const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError("Token is invalid or expires", 404));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // set change passwordAt 

    sendToken(user, 200, res, req);
})

exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');
    // console.log(req.body.password, req.body.passwordConfirm, req.body.passwordCurrent)
    const flag = await user.correctPassword(req.body.passwordCurrent, user.password);
    if (!flag) {
        return next(new AppError("your current password is wrong ", 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    sendToken(user, 200, res, req);
})

