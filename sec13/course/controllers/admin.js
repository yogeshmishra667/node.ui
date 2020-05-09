const mongoose = require('mongoose')

const Product = require('../models/product')

exports.getProducts = async (req, res) => {
  const products = await Product.find()
    //.populate('userId')
    // .select('title price -_id')

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

  const product = new Product({
    title: title, 
    price: price, 
    imageUrl: imageUrl, 
    description: description,
    userId: req.user
  })

  await product.save()

  res.redirect('/admin/products')
}

exports.getEditProduct = async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)

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

  await Product.findByIdAndUpdate(id, 
    {
      title: title, 
      price: price, 
      imageUrl: imageUrl, 
      description: description 
    },
    { useFindAndModify: false }
  ).catch(error => console.log(error))

  res.redirect('/admin/products')
} 

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body

  await Product.findByIdAndDelete(
    { _id: new mongoose.mongo.ObjectID(productId) }, 
    { useFindAndModify: false }
  ).catch(error => console.log(error))

  /**
   * @todo Remove from cart, if required
   */

  res.redirect('/admin/products')
}
