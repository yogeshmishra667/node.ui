const path = require('path')

const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const sockets = require('./socket')

const app = express()

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

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
  console.log(error)

  const status = error.statusCode || 500
  const message = error.message
  const data = error.data

  res
    .status(status)
    .json({ message: message, data: data })
})

mongoose
  .connect('mongodb://localhost:27017/nodejs-api')
  .then(() => {
    const server = app.listen(8080)
    const io = sockets.init(server)
    io.on('connection', socket => {
      console.log('Client connected')
    })
  })
  .catch(err => {
    console.log(err)
  })