const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')
const { mongoConnect } = require('./util/database')
const User = require('./models/user')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(async (req, res, next) => {
  const user = await User.fetchById('5e9c4d3eab033f3d8c68e391')
  
  if (user) {
    req.user = new User(
      user.username, 
      user.email, 
      user.cart, 
      user._id
    )
    next()
  } else {
    res.send('No User Found')
  }
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404);

mongoConnect(() => app.listen(3002))
