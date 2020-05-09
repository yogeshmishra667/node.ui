const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', 
  shopController.protectPage, 
  shopController.getCart
);

router.post('/cart', 
  shopController.protectPage, 
  shopController.postCart
);

router.post('/cart-delete-item', 
  shopController.protectPage, 
  shopController.postCartDeleteProduct
);

router.post('/create-order', 
  shopController.protectPage, 
  shopController.postOrder
);

router.get('/orders', 
  shopController.protectPage, 
  shopController.getOrders
);

module.exports = router;
