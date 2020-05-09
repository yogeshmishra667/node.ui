const path = require('path')

const express = require('express')

const route = require('./route')

const app = express()

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
)

app.use(route)

app.use((req, res) => {
  res
    .status(404)
    .sendFile(
      path.join(__dirname, 'views', '404.html')
    )
})

app.listen(3002)
