const Product = require('../models/product')

exports.getIndex = async (req, res) => {
  const products = await Product.fetchAll()

  res.render('shop/index', {
    pageTitle: 'Online Shop',
    path: '/', 
    products: products
  })
}

exports.getProducts = async (req, res) => {
  const products = await Product.fetchAll()

  res.render('shop/product-list', {
    pageTitle: 'Online Shop Products',
    path: '/products', 
    products: products
  })
}

exports.getProduct = async (req, res) => {
  const productId = req.params.productId

  const product = await Product.fetchById(productId)

  if (!product) {
    console.log('Error retrieving product')
    res.redirect('/')
  }

  res.render('shop/product-detail', {
    pageTitle: 'View product',
    path: '/product-detail',
    product: product,
  })
}

exports.postAddToCart = async (req, res) => {
  const { productId } = req.body

  const product = await Product.fetchById(productId)

  const result = await req.user.addToCart(product)

  if (!result.result.ok) {
    console.log('Unable to add product to cart')
    res.redirect('/')
  }

  res.redirect('/cart')
}

exports.getCart = async (req, res) => {
  const products = await req.user.getCart()

  res.render('shop/cart', {
    pageTitle: 'Your shopping Cart',
    path: '/cart',
    products: products
  })
}

exports.postCartDeleteItem = async (req, res) => {
  const { productId } = req.body

  const result = await req.user.removeFromCart(productId)

  if (!result.result.ok) {
    console.log('Unable to remove product from cart')
  }

  res.redirect('/cart')
}

exports.postCreateOrder = async (req, res) => {
  const result = await req.user.createOrder()

  if (result.result.ok) {
    res.redirect('/orders')
  } else {
    console.log('Unable to create order')
    res.redirect('/cart')
  }
}

exports.getOrders = async (req, res) => {
  const orders = await req.user.getOrders()

  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
    orders: orders
  })
}
