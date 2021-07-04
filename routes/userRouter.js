const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');



const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);

router.route('/me').get(userController.getMe, userController.getOne);
router.route('/updatePassword').patch(authController.updatePassword);
router.route('/updateMe').patch(userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUser);
router.route('/:id').delete(userController.deleteUser);





module.exports = router;