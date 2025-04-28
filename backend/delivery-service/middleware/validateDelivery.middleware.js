const { body, validationResult } = require('express-validator');

// Middleware to validate delivery data
const validateDelivery = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = validateDelivery;