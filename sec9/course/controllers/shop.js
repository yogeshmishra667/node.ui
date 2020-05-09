const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getIndex = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop/index', { 
      pageTitle: 'Online Shop',
      path: '/', 
      products: products
    })
  })
}

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', { 
      pageTitle: 'Products',
      path: '/products', 
      products: products
    })
  })
}

exports.getProduct = (req, res) => {
  const productId = req.params.productId

  Product.fetchById(productId, product => {
    res.render('shop/product-detail', {
      pageTitle: 'View product',
      path: '/product-detail', 
      product: product
    })
  })
}

exports.postAddToCart = (req, res) => {
  const { productId } = req.body
 
  Product.fetchById(productId, product => {
    Cart.addProductById(product.id, product.price)
    res.redirect('/')
  })
}

exports.getCart = (req, res) => {
  Cart.fetchAll(cart => {
    Product.fetchAll(products => {
      const cartProducts = cart.products.map(cartProduct => {
        return { 
          ...cartProduct, 
          ...products.find(
            product => product.id === cartProduct.id
          )}
      })
      
      cart.products = cartProducts

      res.render('shop/cart', {
        pageTitle: 'Your shopping Cart',
        path: '/cart',
        cart: cart
      })
    })
  })
}

exports.postCartDeleteItem = (req, res) => {
  const { productId } = req.body
  Product.fetchById(productId, product => {
    Cart.deleteProductById(productId, product.price)
    res.redirect('/cart')
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