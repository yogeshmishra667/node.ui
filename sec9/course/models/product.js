const path = require('path')
const fs = require('fs')

const Cart = require('../models/cart')

const filePath = path.join(
  path.dirname(process.mainModule.filename), 
  'data', 
  'products.json'
)

const getProductsFromFile = (callback) => {
  fs.readFile(filePath, (error, content) => {
    const products = (!error && content.length > 0) 
      ? JSON.parse(content)
      : []

    callback(products)
  })
}

const writeProductsToFile = (products, callback) => {
  fs.writeFile(filePath, JSON.stringify(products), error => {
    callback(error)
  })
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    this.id = this.id
      ? this.id
      : Math.random().toString()

    getProductsFromFile(products => {
      const existingProductIndex = products.findIndex(
        product => product.id === this.id
      )

      if (existingProductIndex > -1) {
        products[existingProductIndex] = this
      } else {
        products.push(this)
      }

      writeProductsToFile(products, error => {
        if (error) {
          console.log(err)
        }
      })
    })
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const productIndex = products.findIndex(
        product => product.id === id
      )

      const deleted = productIndex > -1
        ? products.splice(productIndex, 1)[0]
        : null

      if (deleted) {
        writeProductsToFile(products, error => {
          if (error) {
            console.log(err)
          } else {
            Cart.deleteProductById(deleted.id, deleted.price)
          }
        })
      }
    })
  }

  static fetchAll(callback) {
    getProductsFromFile(callback)
  }

  static fetchById(id, callback) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id)
      callback(product)
    })
  }
}
