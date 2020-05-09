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
  res.render('admin/edit-product', {
    pageTitle: 'Add a Product',
    path: '/admin/edit-product',
    edit: false
  })
}

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body
  const product = new Product(null, title, imageUrl, description, price)
  product.save()
  
  res.redirect('/admin/products')
}

exports.getEditProduct = (req, res) => {
  const { productId } = req.params

  Product.fetchById(productId, product => {
    res.render('admin/edit-product', {
      pageTitle: 'Edit a product',
      path: '/edit-product/detail',
      product: product,
      edit: true
    })
  })
}

exports.postEditProduct = (req, res) => {
  const { id, title, imageUrl, price, description } = req.body
  const product = new Product(id, title, imageUrl, description, price)
  product.save() 
  
  res.redirect('/admin/products')
}

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body
  Product.deleteById(productId)

  res.redirect('/admin/products')
}