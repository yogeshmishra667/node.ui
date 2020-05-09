const Product = require('../models/product')

exports.getIndex = (req, res) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', { 
        pageTitle: 'Online Shop',
        path: '/', 
        products: products
      })
    })
    .catch(error => console.log(error))
}

exports.getProducts = (req, res) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', { 
        pageTitle: 'Online Shop Products',
        path: '/products', 
        products: products
      })
    })
    .catch(error => console.log(error))
}

exports.getProduct = (req, res) => {
  const productId = req.params.productId

  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: 'View product',
        path: '/product-detail',
        product: product,
      })
    })
}

exports.postAddToCart = async (req, res) => {
  const { productId } = req.body

  let cart = await req.user.getCart()
    .catch(error => console.log(error))

  /* if (!cart) {
    cart = await req.user.createCart()
      .catch(error => console.log(error))
  } */

  const cartProducts = await cart.getProducts({
    where: { id: productId }
  })

  const existingProduct = cartProducts.length > 0
    ? cartProducts[0]
    : null

  const quantity = existingProduct
    ? existingProduct.cartItem.quantity += 1
    : 1

  const product = !existingProduct
    ? await Product.findByPk(productId)
    : existingProduct
  
  if (!product) {
    console.log(`Unable to add ${productId} to the cart`)
    res.redirect('/')
  }

  await cart.addProduct(product, {
    through: { quantity: quantity }
  })

  res.redirect('/cart')
}

exports.getCart = async (req, res) => {
  let cart = await req.user.getCart()
    .catch(error => console.log(error))

  /* if (!cart) {
    cart = await req.user.createCart()
      .catch(error => console.log(error))
  } */

  const products = await cart.getProducts()
    .catch(error => console.log(error))

  res.render('shop/cart', {
    pageTitle: 'Your shopping Cart',
    path: '/cart',
    products: products
  })
}

exports.postCartDeleteItem = async (req, res) => {
  const { productId } = req.body

  let cart = await req.user.getCart()
    .catch(error => console.log(error))

  const cartProducts = await cart.getProducts({
    where: { id: productId }
  })

  const existingProduct = cartProducts.length > 0
    ? cartProducts[0]
    : null

  if (!existingProduct) {
    console.log('Product is not in the cart')
  } else {
    await existingProduct.cartItem.destroy()
  }

  res.redirect('/cart')
}

exports.postCreateOrder = async (req, res) => {
  const cart = await req.user.getCart()

  const products = await cart.getProducts()

  if (!products) {
    console.log('There are no products in the users cart')
    res.redirect('/cart')
  }

  const orderItems = products.map(product => {
    product.orderItem = { quantity: product.cartItem.quantity }
    return product
  })

  const order = await req.user.createOrder()

  await order.addProducts(orderItems)

  await cart.setProducts(null)

  res.redirect('/orders')
}

exports.getOrders = async (req, res) => {
  const orders = await req.user.getOrders({
    include: ['products']
  })

  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
    orders: orders
  })
}
