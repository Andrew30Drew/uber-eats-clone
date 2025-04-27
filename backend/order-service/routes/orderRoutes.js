const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const orderController        = require('../controllers/orderController');
const { handleValidationErrors } = require('../middlewares/validate');

// Create Order (with validation)
router.post(
  '/',
  [
    body('userId')       .notEmpty().withMessage('userId is required'),
    body('restaurantId') .notEmpty().withMessage('restaurantId is required'),
    body('items')        .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('totalAmount')  .isNumeric().withMessage('totalAmount must be a number'),
  ],
  handleValidationErrors,
  orderController.createOrder
);

// Specific routes first
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/:id',           orderController.getOrderById);

router.put('/:id',           orderController.updateOrder);
router.delete('/:id',        orderController.cancelOrder);
router.patch('/:id/status',  orderController.updateOrderStatus);

module.exports = router;
