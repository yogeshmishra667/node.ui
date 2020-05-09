const Product = require('../models/product')

exports.getProducts = (req, res) => {
  Product.fetchAll()
    .then(([products]) => {
      res.render('admin/products', { 
        pageTitle: 'Online Shop Admin',
        path: '/', 
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
  product.upsert()
    .then(result => {
      res.redirect('/admin/products')
    })
    .catch(error => {
      console.log(error)
    })
}

exports.getEditProduct = (req, res) => {
  const { productId } = req.params

  Product.fetchById(productId)
    .then(([products]) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit a product',
        path: '/edit-product/detail',
        product: products[0],
        edit: true
      })
    })
}

exports.postEditProduct = (req, res) => {
  const { id, title, imageUrl, price, description } = req.body
  const product = new Product(id, title, imageUrl, description, price)
  product.upsert()
    .then(result => {
      res.redirect('/admin/products')
    })
    .catch(error => {
      console.log(error)
    })
}

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body
  Product.deleteById(productId)
    .then(result => {
      res.redirect('/admin/products')
    })
    .catch(error => {
      console.log(error)
    })
}