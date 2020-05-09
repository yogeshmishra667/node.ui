const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')
const sequelize = require('./util/database')

const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user
      next()
    })
    .catch(error => console.log(error))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true })
Product.belongsToMany(Cart, { through: CartItem })
Product.belongsToMany(Order, { through: OrderItem })

User.hasMany(Product)
User.hasMany(Order)
User.hasOne(Cart)

Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: CartItem })

Order.belongsTo(User)
Order.belongsToMany(Product, { through: OrderItem })

sequelize
  .sync(/* { force: true } */)
  .then(() => User.findByPk(1))
  .then(user => {
    return (!user)
      ? User.create({ name: 'Kevan Stuart', email: 'kevan.jedi@gmail.com' })
      : Promise.resolve(user)
  })
  .then(async user => {
    const cart = await user.getCart()
    return (!cart)
      ? user.createCart()
      : cart
  })
  .then(() => app.listen(3002))
  .catch(error => console.log(error))
