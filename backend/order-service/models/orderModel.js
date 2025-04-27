const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [{
    itemId:   { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount:  { type: Number, required: true },
  status: {
    type:    String,
    enum:    ['Pending','Preparing','Ready','Out for Delivery','Delivered','Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type:    String,
    enum:    ['Unpaid','Paid','Failed'],
    default: 'Unpaid'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
