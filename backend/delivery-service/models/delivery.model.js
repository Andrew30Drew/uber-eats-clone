const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  deliveryAddress: { type: String, required: true },
  deliveryDate: { type: Date, default: Date.now },
});

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
