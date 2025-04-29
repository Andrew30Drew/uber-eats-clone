// backend/order-service/models/cartModel.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId:       { type: String, required: true, unique: true },
  restaurantId: { type: String },
  items: [
    {
      itemId:   { type: String, required: true },
      name:     { type: String, required: true },
      price:    { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
