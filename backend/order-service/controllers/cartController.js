// backend/order-service/controllers/cartController.js
const Cart = require('../models/cartModel');

exports.addItem = async (req, res) => {
  const { userId } = req.params;
  const { restaurantId, itemId, name, price, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    // Enforce single-restaurant per cart
    if (cart.items.length && cart.restaurantId !== restaurantId) {
      return res
        .status(400)
        .json({ message: 'All items in one cart must come from the same restaurant' });
    }
    cart.restaurantId = restaurantId;

    // Upsert item
    const existing = cart.items.find(i => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ itemId, name, price, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.json({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  const { userId, itemId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.itemId !== itemId);
    if (!cart.items.length) cart.restaurantId = undefined;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = [];
      cart.restaurantId = undefined;
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
