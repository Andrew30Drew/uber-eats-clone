// backend/order-service/routes/index.js
const express      = require('express');
const cartRoutes   = require('./cartRoutes');      // if you have cart
const orderRoutes  = require('./orderRoutes');
// const paymentRoutes = require('./paymentRoutes'); // if you have payment

const router = express.Router();

// e.g. POST /api/cart/:userId/items
router.use('/cart', cartRoutes);

// POST /api/orders, GET /api/orders, etc…
router.use('/orders', orderRoutes);

// if you later add payment service:
 // router.use('/payment', paymentRoutes);

module.exports = router;
