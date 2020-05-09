const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const { validationResult } = require('express-validator')

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }

  const { email, password, name } = req.body
  bcrypt.hash(password, 12)
    .then(encrypted => {
      const user = new User({
        password: encrypted,
        email: email, 
        name: name
      })
      return user.save()
    })
    .then(result => {
      res
        .status(201)
        .json({
          message: 'User created successfully' ,
          userId: result._id
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.login = (req, res, next) => {
  const { email, password } = req.body

  let foundUser

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('No such user found')
        error.statusCode = 401
        throw error
      }

      foundUser = user

      return bcrypt.compare(password, user.password)
    })
    .then(isAuthenticated => {
      if (!isAuthenticated) {
        const error = new Error('Incorrect email or password')
        error.statusCode = 401
        throw error
      }

      const token = jwt.sign(
        { 
          userId: foundUser._id.toString(),
          email: foundUser.email
        }, 
        'nodejsjwttokensecret', 
        { expiresIn: '1h' }
      )

      res
        .status(200)
        .json({
          userId: foundUser._id.toString(),
          token: token
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      res
        .status(200)
        .json({ status: user.status })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.updateStatus = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    throw error
  }

  const status = req.body.status

  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      user.status = status

      return user.save()
    })
    .then(user => {
      res
        .status(200)
        .json({
          message: 'Status updated successfully',
          status: status
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}
