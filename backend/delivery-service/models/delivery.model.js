const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    driverId: { type: String, required: true },
    status: { type: String, default: 'Assigned' }
}, { timestamps: true }); // Enable automatic createdAt and updatedAt fields

module.exports = mongoose.model('Delivery', deliverySchema);
