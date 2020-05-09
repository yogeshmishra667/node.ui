const Product = require('../models/product')

exports.getAddProduct = (req, res) => {
  res.render('add-product', {
    pageTitle: 'Add a Product',
    path: 'add-product'
  })
}

exports.postAddProduct = (req, res) => {
  const product = new Product(req.body.title).save()
  res.redirect('/')
}

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop', { 
      pageTitle: 'Ye Olde Shoppe',
      path: 'shop', 
      products: products
    })
  })
}