const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
  [
    body('email', 'Invalid username or password')
      .notEmpty()
      .isEmail(),
    body('password', 'Invalid username or password')
      .isLength({ min: 5 })
      .isAlphanumeric()
  ],
  authController.postLogin
);

router.post('/signup', 
  [
    check('email', 'Please enter a valid email')
      .notEmpty()
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(user => {
            if (user) {
              return Promise.reject('Email already exists, please try again.');
            }
          });
      }),
    body('password', 'Your password must be at least 6 characters long, no special characters')
      .isLength({ min: 6 })
      .isAlphanumeric(),
    body('confirmPassword', 'Please confirm your password')
      .notEmpty()
      .custom((value, { req }) => value === req.body.password)
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getSetNewPassword);

router.post('/new-password', authController.postSetNewPassword);

module.exports = router;