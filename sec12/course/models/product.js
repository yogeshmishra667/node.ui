const { getDb, objectId } = require('../util/database')

class Product {
  constructor(title, price, imageUrl, description, id = null, userId = null) {
    this.title = title
    this.price = price
    this.imageUrl = imageUrl
    this.description = description
    this._id = objectId(id)
    this.userId = userId
  }

  save() {
    const db = getDb()
    return db.collection('products').updateOne(
      { _id: this._id }, { $set: this }, { upsert: true }
    )
      .catch(error => console.log(error))
  }

  static fetchAll() {
    const db = getDb()
    return db.collection('products')
      .find()
      .toArray()
      .catch(error => console.log(error))
  }

  static fetchById(productId) {
    const db = getDb()
    return db.collection('products')
      .findOne({ _id: objectId(productId) })
      .catch(error => console.log(error))
  }

  static deleteById(productId) {
    const db = getDb()
    return db.collection('products')
      .deleteOne({ _id: objectId(productId) })
      .catch(error => console.log(error))
  }
}

module.exports = Product
