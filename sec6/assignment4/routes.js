const express = require('express')

const router = express.Router()

const users = []

router.get('/users', (req, res) => {
  res.render(
    'users', 
    { 
      users: users ,
      'path': 'users', 
      'page': 'List users'
    }
  )
})

router.get('/', (req, res) => {
  res.render(
    'index',
    { 'path': 'home', 'page': 'Add a User'}
  )
})

router.post('/', (req, res) => {
  users.push(req.body.name)
  res.redirect('/users')
})

module.exports = router