const Cart  = require('../models/cartModel');
const Order = require('../models/orderModel');

function calcTotal(items) {
  // In real life you’d fetch item prices from Restaurant Service.
  // Here we assume frontend/DB sends totalAmount at checkout.
  return items.reduce((sum,i)=> sum + (i.price || 0) * i.quantity, 0);
}

// GET /api/cart/:userId
exports.getCart = async (req, res) => {
  const { userId } = req.params;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, restaurantId: '', items: [] });
  }
  res.json(cart);
};

// POST /api/cart/:userId/items
// body: { restaurantId, itemId, quantity }
exports.addItem = async (req, res) => {
  const { userId } = req.params;
  const { restaurantId, itemId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, restaurantId, items: [] });
  }
  if (cart.restaurantId && cart.restaurantId !== restaurantId) {
    return res.status(400).json({ message: 'Cannot mix restaurants in one cart' });
  }
  cart.restaurantId = restaurantId;

  const idx = cart.items.findIndex(i => i.itemId === itemId);
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ itemId, quantity });
  }
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
};

// PUT /api/cart/:userId/items/:itemId
// body: { quantity }
exports.updateItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity }        = req.body;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items
    .map(i => i.itemId === itemId ? { ...i.toObject(), quantity } : i)
    .filter(i => i.quantity > 0);

  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
};

// DELETE /api/cart/:userId/items/:itemId
exports.removeItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(i => i.itemId !== itemId);
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
};

// POST /api/cart/:userId/checkout
// body: { totalAmount }
exports.checkout = async (req, res) => {
  const { userId } = req.params;
  const { totalAmount } = req.body;

  const cart = await Cart.findOneAndDelete({ userId });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Build order from cart
  const order = new Order({
    userId: cart.userId,
    restaurantId: cart.restaurantId,
    items: cart.items,
    totalAmount,
    status: 'Pending',
    paymentStatus: 'Unpaid'
  });
  await order.save();
  res.status(201).json(order);
};
