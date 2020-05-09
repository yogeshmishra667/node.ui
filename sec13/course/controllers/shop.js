const mongoose = require('mongoose')

const Product = require('../models/product')
const Order = require('../models/order')

exports.getIndex = async (req, res) => {
  const products = await Product.find()

  res.render('shop/index', {
    pageTitle: 'Online Shop',
    path: '/', 
    products: products
  })
}

exports.getProducts = async (req, res) => {
  const products = await Product.find()

  res.render('shop/product-list', {
    pageTitle: 'Online Shop Products',
    path: '/products', 
    products: products
  })
}

exports.getProduct = async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)

  res.render('shop/product-detail', {
    pageTitle: 'View product',
    path: '/product-detail',
    product: product,
  })
}

exports.postAddToCart = async (req, res) => {
  const { productId } = req.body

  const product = await Product.findById(productId)

  if (!product) {
    console.log(`Product ${productId} not found`)
    res.redirect('/')
  }

  await req.user.addToCart(product)

  res.redirect('/cart')
}

exports.getCart = async (req, res) => {
  const user = await req.user
    .populate('cart.items.productId')
    .execPopulate()

  const products = user.cart.items || []

  res.render('shop/cart', {
    pageTitle: 'Your shopping Cart',
    path: '/cart',
    products: products
  })
}

exports.postCartDeleteItem = async (req, res) => {
  const { productId } = req.body

  await req.user.removeFromCart(productId)

  res.redirect('/cart')
}

exports.postCreateOrder = async (req, res) => {
  const user = await req.user
    .populate('cart.items.productId')
    .execPopulate()

  const cartItems = user.cart.items || []

  if (cartItems.length === 0) {
    console.log(`Unable to create order from cart`)
    res.redirect('/cart')
  }

  const products = cartItems.map(item => ({
    quantity: item.quantity,
    product: { ...item.productId._doc }
  }))

  const total = products.reduce(
    (total, product) => total + (product.product.price * product.quantity),
    0
  )

  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user._id
    },
    products: products,
    total: total
  })

  await order.save()

  await req.user.clearCart()

  res.redirect('/orders')
}

exports.getOrders = async (req, res) => {
  const orders = await Order.find({
    'user.userId': req.user._id
  })

  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
    orders: orders
  })
}
