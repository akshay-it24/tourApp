const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "please provide your name"]
    },
    email: {
        type: String,
        require: [true, "please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        require: [true, 'please provide your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'please provide your confirm password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "password are not same"
        }
    },
    changePasswordAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.pre('save', async function (next) {
    // if password is not modifies
    if (!this.isModified('password')) {
        return next();
    }
    //encrypt password with the cost 12
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.changePasswordAt = Date.now() - 1000;
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // console.log(candidatePassword, userPassword);
    return await bcrypt.compare(candidatePassword, userPassword);
};



userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
    if (this.changePasswordAt) {
        const changePasswordTime = parseInt(this.changePasswordAt.getTime() / 1000, 10);
        if (changePasswordTime > JWTTimeStamp) {
            return true;
        }
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;