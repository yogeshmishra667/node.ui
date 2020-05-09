const Product = require('../models/product')
// const Cart = require('../models/cart')

exports.getProducts = async (req, res) => {
  const products = await req.user.getProducts()

  res.render('admin/products', {
    pageTitle: 'Online Shop Admin',
    path: '/admin/products', 
    products: products
  })
}

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add a Product',
    path: '/admin/edit-product',
    edit: false
  })
}

exports.postAddProduct = async (req, res) => {
  const { title, imageUrl, price, description } = req.body

  const product = await req.user
    .createProduct({ title, imageUrl, price, description })
    .catch(error => console.log(error))

  if (!product) {
    console.log('Unable to create product')
  }

  res.redirect('/admin/products')
}

exports.getEditProduct = async (req, res) => {
  const { productId } = req.params

  const products = await req.user
    .getProducts({ where: { id: productId }})
    .catch(error => console.log(error))

  if (!products) {
    console.log('Error retrieving product')
    res.redirect('/admin/products')
  }

  res.render('admin/edit-product', {
    pageTitle: 'Edit a product',
    path: '/edit-product/detail',
    product: products[0],
    edit: true
  })
}

exports.postEditProduct = async (req, res) => {
  const { id, title, imageUrl, price, description } = req.body

  const product = await Product.findByPk(id)

  if (!product) {
    console.log('Product not found')
    res.redirect('/admin/products')
  }

  product.title = title
  product.price = price
  product.imageUrl = imageUrl
  product.description = description

  const result = await product.save()
    .catch(error => console.log(error))

  if (!result) {
    console.log('Unable to save product')
    res.redirect(`/admin/edit-product/${id}`)
  }

  res.redirect('/admin/products')
} 

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body

  const product = await Product.findByPk(productId)

  if (!product) {
    console.log('No product to delete')
    res.redirect('/admin/products')
  }

  const result = await product.destroy()
    .catch(error => console.log(error))

  if (!result) {
    console.log('Unable to delete product')
  }

  res.redirect('/admin/products')
}
