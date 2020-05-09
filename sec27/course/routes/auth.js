const express = require('express')

const { body } = require('express-validator')

const authController = require('../controllers/auth')
const isAuth = require('../middleware/isAuth')
const User = require('../models/user')

const router = express.Router()

router.put('/signup', [
  body('email')
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(user => {
          if (user) {
            return Promise.reject('Email already exists.');
          }
        });
    })
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }),
  body('name').trim().notEmpty()], 
  authController.signup
)

router.post('/login', authController.login)

router.get('/status', isAuth, authController.getStatus)

router.patch(
  '/status', isAuth, 
  [
    body('status').trim().notEmpty()
  ],
  authController.updateStatus
)

module.exports = router