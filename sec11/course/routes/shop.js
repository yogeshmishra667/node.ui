const express = require('express')

const shopController = require('../controllers/shop')

const router = express.Router()

router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

router.get('/products/:productId', shopController.getProduct)

router.get('/cart', shopController.getCart)

router.post('/add-to-cart', shopController.postAddToCart)

router.post('/cart-delete-item', shopController.postCartDeleteItem)

router.post('/create-order', shopController.postCreateOrder)

router.get('/orders', shopController.getOrders)

module.exports = router
