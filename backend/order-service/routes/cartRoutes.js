// backend/order-service/routes/cartRoutes.js
const express        = require('express');
const router         = express.Router();
const cartController = require('../controllers/cartController');

// Add item
// POST /api/cart/:userId/items
router.post('/:userId/items', cartController.addItem);

// Get current user’s cart
// GET /api/cart/:userId/items
router.get('/:userId/items',  cartController.getCart);

// Remove a single item
// DELETE /api/cart/:userId/items/:itemId
router.delete('/:userId/items/:itemId', cartController.removeItem);

// Clear entire cart
// DELETE /api/cart/:userId/clear
router.delete('/:userId/clear', cartController.clearCart);

module.exports = router;
