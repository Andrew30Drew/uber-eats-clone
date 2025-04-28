const Delivery = require('../models/delivery.model');

// Create a new delivery
exports.createDelivery = async (req, res, next) => {
  try {
    const { orderId, deliveryAddress } = req.body;
    const delivery = new Delivery({ orderId, deliveryAddress });
    await delivery.save();
    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(id, { status }, { new: true });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// Get delivery by orderId
exports.getDeliveryByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};
