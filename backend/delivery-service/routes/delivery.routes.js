const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validateDelivery = require('../middleware/validateDelivery.middleware');

// Create a new delivery
router.post('/', authMiddleware, validateDelivery, deliveryController.createDelivery);

// Update delivery status
router.patch('/:id/status', authMiddleware, deliveryController.updateDeliveryStatus);

// Get delivery by orderId
router.get('/:orderId', authMiddleware, deliveryController.getDeliveryByOrderId);

module.exports = router;
