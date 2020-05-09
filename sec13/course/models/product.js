const mongoose = require('mongoose')

const { loadType } = require('mongoose-currency')

const Schema = mongoose.Schema

loadType(mongoose)

const Currency = mongoose.Types.Currency

const productSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  price: {
    type: Currency,
    required: true
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

module.exports = mongoose.model('Product', productSchema)
