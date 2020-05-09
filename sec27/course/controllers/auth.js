const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const { validationResult } = require('express-validator')

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }

  const { email, password, name } = req.body

  try {
    const encrypted = await bcrypt.hash(password, 12)

    const user = new User({
      password: encrypted,
      email: email, 
      name: name
    })

    const result = await user.save()

    res
      .status(201)
      .json({
        message: 'User created successfully' ,
        userId: result._id
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email: email })

    if (!user) {
      const error = new Error('No such user found')
      error.statusCode = 401
      throw error
    }

    const isAuthenticated = await bcrypt.compare(
      password, user.password
    )

    if (!isAuthenticated) {
      const error = new Error('Incorrect email or password')
      error.statusCode = 401
      throw error
    }

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email
      }, 
      'nodejsjwttokensecret', 
      { expiresIn: '1h' }
    )

    res
      .status(200)
      .json({
        userId: user._id.toString(),
        token: token
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    res
      .status(200)
      .json({ status: user.status })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    throw error
  }

  const status = req.body.status

  try {
    const user = await User.findById(req.userId)

    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    user.status = status

    await user.save()

    res
      .status(200)
      .json({
        message: 'Status updated successfully',
        status: status
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}
