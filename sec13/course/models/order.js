const mongoose = require('mongoose')

const { loadType } = require('mongoose-currency')

const Schema = mongoose.Schema

loadType(mongoose)

const schema = new Schema({
  products: [{ 
    product: {
      type: Object,
      required: true 
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    }
  },
  total: {
    type: mongoose.Types.Currency,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Order', schema)
