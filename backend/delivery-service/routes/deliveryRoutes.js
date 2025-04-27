// delivery-service/routes/deliveryRoutes.js

const express = require('express');
const router = express.Router();

// In-memory database (for now)
let deliveries = [];
let idCounter = 1;

// Create a new delivery assignment
router.post('/', (req, res) => {
    const { orderId, driverId } = req.body;

    const newDelivery = {
        id: idCounter++,
        orderId,
        driverId,
        status: 'Assigned',
        createdAt: new Date()
    };

    deliveries.push(newDelivery);
    res.status(201).json(newDelivery);
});

// Update delivery status
router.patch('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const delivery = deliveries.find(d => d.id == id);
    if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
    }

    delivery.status = status;
    res.json(delivery);
});

// Get delivery info by orderId
router.get('/:orderId', (req, res) => {
    const { orderId } = req.params;
    const delivery = deliveries.find(d => d.orderId == orderId);

    if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
});

module.exports = router;
