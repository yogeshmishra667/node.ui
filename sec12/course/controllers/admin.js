const Product = require('../models/product')

exports.getProducts = async (req, res) => {
  const products = await Product.fetchAll()

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
  const { title, price, imageUrl, description } = req.body

  const product = new Product(
    title, 
    price, 
    imageUrl, 
    description, 
    null, 
    req.user._id
  )

  await product.save()  

  res.redirect('/admin/products')
}

exports.getEditProduct = async (req, res) => {
  const { productId } = req.params

  const product = await Product.fetchById(productId)

  if (!product) {
    console.log('Error retrieving product')
    res.redirect('/admin/products')
  }

  res.render('admin/edit-product', {
    pageTitle: 'Edit a product',
    path: '/edit-product/detail',
    product: product,
    edit: true
  })
}

exports.postEditProduct = async (req, res) => {
  const { id, title, imageUrl, price, description } = req.body

  const existingProduct = await Product.fetchById(id)

  if (!existingProduct) {
    console.log(`Product ${id} - ${title} does not exist`)
    res.redirect('/admin/products')
  }

  const product = new Product(title, price, imageUrl, description, id)
  const result = await product.save()

  if (!result) {
    console.log('Unable to save product')
    res.redirect(`/admin/edit-product/${id}`)
  }

  res.redirect('/admin/products')
} 

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body

  const existingProduct = await Product.fetchById(productId)

  if (!existingProduct) {
    console.log(`Product ${id} - ${title} does not exist`)
    res.redirect('/admin/products')
  }

  const result = await Product.deleteById(productId)

  if (!result) {
    console.log('Unable to delete product')
  }

  res.redirect('/admin/products')
}
