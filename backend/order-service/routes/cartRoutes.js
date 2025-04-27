const express = require('express');
const router  = express.Router();
const c       = require('../controllers/cartController');

// Fetch or create cart
router.get('/:userId',                 c.getCart);
// Add item
router.post('/:userId/items',          c.addItem);
// Update quantity
router.put('/:userId/items/:itemId',   c.updateItem);
// Remove item
router.delete('/:userId/items/:itemId',c.removeItem);
// Checkout => creates Order then clears cart
router.post('/:userId/checkout',       c.checkout);

module.exports = router;
