const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const errorController = require('./controllers/error')
const User = require('./models/user')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(async (req, res, next) => {
  req.user = await User.findById('5e9f2ec77762ae8b303083f6')
  next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404);

mongoose.connect(
  'mongodb://localhost:27017/nodejs-mongoose',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
  const existingUser = User.findOne()
  if (!existingUser) {
    const user = new User({
      name: 'Kevan Stuart',
      email: 'kevan.jedi@gmail.com',
      cart: { items: [] }
    })
    user.save()
  }
  app.listen(3002)
})
.catch(error => console.log(error))
