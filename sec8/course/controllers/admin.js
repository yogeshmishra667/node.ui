const Product = require('../models/product')

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
    res.render('admin/products', { 
      pageTitle: 'Ye Olde Shoppe Admin',
      path: '/admin/products', 
      products: products
    })
  })
}

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add a Product',
    path: '/admin/add-product'
  })
}

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body
  const product = new Product(title, imageUrl, description, price)
  product.save()
  
  res.redirect('/admin/products')
}

exports.getEditProduct = (req, res) => {}