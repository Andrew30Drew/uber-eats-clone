// backend/order-service/models/orderModel.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  itemId:       { type: String, required: true },
  name:         { type: String, required: true },
  price:        { type: Number, required: true },
  quantity:     { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  restaurantId: { type: String, required: true },
  items:        [ itemSchema ],
  totalAmount:  { type: Number, required: true },
  status: {
    type: String,
    enum: [ 'Pending','Preparing','Ready','Out for Delivery','Delivered','Cancelled' ],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: [ 'Unpaid','Paid','Failed' ],
    default: 'Unpaid'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
