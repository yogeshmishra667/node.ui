const path = require('path')
const fs = require('fs')

const httpGraphql = require('express-graphql')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')

const app = express()

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const { clearImage } = require('./util/file')
const auth = require('./middleware/auth')

const fileStore = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'images')
  },
  filename: function(req, file, cb) {
    cb(null, `${uuidv4()}-${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  switch (file.mimetype) {
    case 'image/png':
    case 'image/jpg':
    case 'image/jpeg':
      cb(null, true)
    default:
      cb(null, false)
  }
}

app.use(bodyParser.json())
app.use(
  multer({ 
    storage: fileStore, fileFilter: fileFilter 
  }).single('image')
)

app.use('/images', express.static(
  path.join(__dirname, 'images')
))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(auth)

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error('Not authenticated')
    error.code = 401
    throw error
  }

  if (!req.file) {
    return res
      .status(200)
      .json({ message: 'No file provided' })
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath)
  }

  return res
    .status(201)
    .json({ 
      message: 'File Stored', 
      path: req.file.path
    })
})

app.use('/graphql', httpGraphql({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(error) {
    if (!error.originalError) {
      return error
    }

    const data = error.originalError.data
    const message = error.message || 'An error occurred'
    const code = error.originalError.code || 500

    return {
      message: message,
      status: code,
      data: data
    }
  },
}))

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data

  res
    .status(status)
    .json({ message: message, data: data })
})

mongoose
  .connect('mongodb://localhost:27017/nodejs-graphql')
  .then(() => app.listen(8080))
  .catch(err => console.log(err))
