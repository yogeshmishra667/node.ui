const Product = require('../models/product')

exports.getIndex = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop/index', { 
      pageTitle: 'Ye Olde Shoppe Index',
      path: '/', 
      products: products
    })
  })
}

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', { 
      pageTitle: 'Ye Olde Shoppe Products',
      path: '/products', 
      products: products
    })
  })
}

exports.getCart = (req, res) => {
  res.render('shop/cart', {
    pageTitle: 'Your shopping Cart',
    path: '/cart'
  })
}

exports.getOrders = (req, res) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders'
  })
}

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    pageTitle: 'Pay the Man',
    path: '/checkout'
  })
}