const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');

// Route to create a new delivery
router.post('/', deliveryController.createDelivery);

// Route to update delivery status
router.patch('/:id/status', deliveryController.updateDeliveryStatus);

// Route to get delivery info by orderId
router.get('/:orderId', deliveryController.getDeliveryByOrderId);

module.exports = router;
