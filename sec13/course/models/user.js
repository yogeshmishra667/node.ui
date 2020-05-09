const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{ 
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }, 
      quantity: { 
        type: Number, 
        required: true 
      }
    }],
  }
})

userSchema.methods.addToCart = function(product) {
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
  
  return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
  this.cart.items = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  )

  return this.save()
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] }

  return this.save()
}

module.exports = mongoose.model('User', userSchema)
