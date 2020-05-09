const express = require('express')

const adminData = require('./admin')

const router = express.Router()

router.get('/', (req, res) => {
  const products = adminData.products
  res.render('shop', { 
    products: products, 
    path: 'shop', 
    pageTitle: 'Ye Olde Shoppe'
  })
})

module.exports = router
