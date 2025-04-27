const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  items: [
    {
      itemId:   { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema);
