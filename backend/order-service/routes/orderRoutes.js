// backend/order-service/routes/orderRoutes.js
const express         = require('express');
const { body }        = require('express-validator');
const validate        = require('../middlewares/validate');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Create new order
router.post(
  '/',
  [
    body('userId').notEmpty(),
    body('restaurantId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('totalAmount').isNumeric()
  ],
  validate,
  orderController.createOrder
);

// List all orders
router.get('/', orderController.listOrders);

// Get one by ID
router.get('/:id', orderController.getOrderById);

// Update
router.put('/:id', orderController.updateOrder);

// Cancel
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
