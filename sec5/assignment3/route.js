const path = require('path')

const express = require('express')

const router = express.Router()

router.get('/users', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'users.html')
  )
})

router.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'index.html')
  )
})

module.exports = router