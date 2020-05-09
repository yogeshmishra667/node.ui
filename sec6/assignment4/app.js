const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const route = require('./routes')

const app = express()

app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(route)

app.use((req, res) => {
  res
    .status(404)
    .render('404')
})

app.listen(3002)
