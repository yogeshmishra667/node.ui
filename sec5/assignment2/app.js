const express = require('express')

const application = express()

/* application.use((req, res, next) => {
  console.log('App middleware 1')
  next()
})

application.use((req, res, next) => {
  console.log('App middleware 2')
  res.send('<h1>Returns one response</h1>')
}) */

application.use('/users', (req, res) => {
  res.send('<h1>Users page</h1>')
})

application.use('/', (req, res) => {
  res.send('<h1>Home page</h1>')
})

application.listen(3002)