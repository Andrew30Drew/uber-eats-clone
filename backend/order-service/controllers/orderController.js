// backend/order-service/controllers/orderController.js
const Order = require('../models/orderModel');

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.listOrders = async (_req, res) => {
  try {
    const orders = await Order.find();
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Not found' });
    return res.json(o);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!o) return res.status(404).json({ message: 'Not found' });
    return res.json(o);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Not found' });
    o.status = 'Cancelled';
    await o.save();
    return res.json({ message: 'Cancelled' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
