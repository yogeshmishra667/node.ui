const path = require('path')
const fs = require('fs')

const filePath = path.join(
  path.dirname(process.mainModule.filename), 
  'data', 
  'products.json'
)

const getProductsFromFile = (callback) => {
  fs.readFile(filePath, (error, data) => {
    const products = (!error) 
      ? JSON.parse(data)
      : []

    callback(products)
  })
}

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    getProductsFromFile(products => {
      products.push(this)

      fs.writeFile(filePath, JSON.stringify(products), error => {
        console.log(error)
      })
    })
  }

  static fetchAll(callback) {
    getProductsFromFile(callback)
  }
}
