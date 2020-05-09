const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const rootDir = require('./helpers/path')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const application = express()

application.use(bodyParser.urlencoded())
application.use(express.static(path.join(rootDir, 'public')))

application.use('/admin', adminRoutes)
application.use(shopRoutes)

application.use((req, res, next) => {
  res
    .status(404)
    .sendFile(path.join(rootDir, 'views', '404.html'))
})

application.listen(3002)