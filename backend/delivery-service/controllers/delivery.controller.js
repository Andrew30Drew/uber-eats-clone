const Delivery = require('../models/delivery.model');

// Create a new delivery
exports.createDelivery = async (req, res) => {
    try {
        const { orderId, driverId } = req.body;
        const newDelivery = await Delivery.create({ orderId, driverId });
        res.status(201).json(newDelivery);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create delivery', error: error.message });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const delivery = await Delivery.findByIdAndUpdate(id, { status }, { new: true });
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update delivery status', error: error.message });
    }
};

// Get delivery by orderId
exports.getDeliveryByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const delivery = await Delivery.findOne({ orderId });
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch delivery', error: error.message });
    }
};
