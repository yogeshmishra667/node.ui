const path = require('path')
const fs = require('fs')

const filePath = path.join(
  path.dirname(process.mainModule.filename), 
  'data', 
  'cart.json'
)

const getCartFromFile = (callback) => {
  fs.readFile(filePath, (error, content) => {
    const cart = (!error && content.length > 0)
      ? JSON.parse(content)
      : { products: [], totalPrice: 0 }

    callback(cart)
  })
}

const writeCartToFile = (cart, callback) => {
  fs.writeFile(filePath, JSON.stringify(cart), error => {
    callback(error)
  })
}

module.exports = class Cart {
  constructor() {
    this.products = []
    this.totalPrice = 0
  }

  static fetchAll(callback) {
    getCartFromFile(callback)
  }

  static addProductById(productId, productPrice) {
    getCartFromFile(cart => {
      const existingProductIndex = cart.products.findIndex(
        product => product.id === productId
      )

      if (existingProductIndex > -1) {
        cart.products[existingProductIndex].qty += 1
      } else {
        cart.products = [...cart.products, { id: productId, qty: 1 }]
      }

      cart.totalPrice += parseFloat(productPrice)

      writeCartToFile(cart, error => {
        if (error) {
          console.log(error)
        }
      })
    })
  }

  static deleteProductById(productId, productPrice) {
    getCartFromFile(cart => {
      if (cart.products.length === 0) {
        return
      }

      const productIndex = cart.products.findIndex(
        product => product.id === productId
      )

      if (productIndex === -1) {
        return
      }

      const qty = cart.products[productIndex].qty
      const subtotal = parseFloat(productPrice) * qty

      cart.totalPrice -= subtotal
      cart.products.splice(productIndex, 1)

      writeCartToFile(cart, error => {
        if (error) {
          console.log(error)
        }
      })
    })
  }
}