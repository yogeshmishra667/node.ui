const { getDb, objectId } = require('../util/database')

class User {
  constructor(username, email, cart, id = null) {
    this.username = username
    this.email = email
    this.cart = cart
    this._id = objectId(id)
  }

  save() {
    const db = getDb()
    return db.collection('users')
      .insertOne(this)
      .catch(error => console.log(error))
  }

  addToCart(product) {
    const db = getDb()

    if (this.cart) {
      const existingProductIndex = this.cart.items.findIndex(
        cp => cp.productId.toString() === product._id.toString()
      )

      if (existingProductIndex >= 0) {
        this.cart.items[existingProductIndex].quantity += 1
      } else {
        this.cart.items.push({ productId: product._id, quantity: 1 })
      }
    } else {
      this.cart = {
        items: [{ productId: product._id, quantity: 1 }]
      }
    }
    
    return db.collection('users').updateOne(
      { _id: this._id }, { $set: { cart: this.cart } }
    )
  }

  async getCart() {
    const db = getDb()

    const productIds = this.cart.items.map(
      product => product.productId
    )

    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
    
    return products.map(product => {
      const quantity = this.cart.items.find(
        item => item.productId.toString() === product._id.toString()
      ).quantity

      return { 
        ...product, 
        quantity: quantity
      }
    })
  }

  removeFromCart(productId) {
    const db = getDb()

    this.cart.items = this.cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    )

    return db.collection('users').updateOne(
      { _id: this._id }, { $set: { cart: this.cart } }
    )
  }

  async createOrder() {
    const db = getDb()

    const products = await this.getCart()

    const cartTotal = products.reduce(
      (total, product) => total + parseFloat(product.price),
      0.00
    )

    await db.collection('orders')
      .insertOne({
        items: products,
        user: {
          _id: this._id,
          name: this.name,
          email: this.email
        },
        total: cartTotal,
        date: new Date()
      })

    this.cart.items = []

    return db.collection('users').updateOne(
      { _id: this._id }, { $set: { cart: this.cart } }
    )
  }

  getOrders() {
    const db = getDb()

    return db.collection('orders')
      .find({ 'user._id': this._id })
      .toArray()
  }

  static fetchById(userId) {
    const db = getDb()
    return db.collection('users')
      .findOne({ _id: objectId(userId) })
      .catch(error => console.log(error))
  }
}

module.exports = User