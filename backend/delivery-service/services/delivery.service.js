const Delivery = require('../models/delivery.model');

// Service to create a new delivery
exports.createDelivery = async (orderId, driverId) => {
    return await Delivery.create({ orderId, driverId });
};

// Service to update delivery status
exports.updateDeliveryStatus = async (id, status) => {
    return await Delivery.findByIdAndUpdate(id, { status }, { new: true });
};

// Service to get delivery by orderId
exports.getDeliveryByOrderId = async (orderId) => {
    return await Delivery.findOne({ orderId });
};
