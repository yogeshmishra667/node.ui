const db = require('../util/database')

const Cart = require('../models/cart')

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  async upsert() {
    const query = this.id
      ? 'UPDATE `products` SET title = ?, imageUrl = ?, description = ?, price = ? WHERE id = ?'
      : 'INSERT INTO `products` (title, imageUrl, description, price) VALUES (?, ?, ?, ?);'

    const params = [this.title, this.imageUrl, this.description, this.price]
    if (this.id) {
      params.push(this.id)
    }

    return await db.execute(query, params)
  }
  
  static async fetchAll() {
    return await db.execute(
      'SELECT * FROM `products`'
    )
  }

  static async fetchById(id) {
    return await db.execute(
      'SELECT * FROM `products` WHERE id = ? LIMIT 1',
      [id]
    )
  }

  static async deleteById(id) {
    const result = await db.execute(
      'DELETE FROM `products` WHERE id = ?',
      [id]
    )

    // Remove from cart

    return result[0]
  }
}
