const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        paymentId: mongoose.Schema.Types.ObjectId, // Unique ID for the payment

        customerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', // Reference to User model
            required: true 
        },
        restaurantOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order", // Reference to Order model
            required: true
        },
        paypalOrderId: {
            type: String,
            required: true
        },
        payerName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },              
        currency: {
            type: String,
            required: true,
        },
        paymentDetails: {
            type: Object,
            required: true,  // whole PayPal response
        },
        paidAt: { 
            type: Date,
            required: true, 
            default: Date.now 
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },

    },
    { 
        timestamps: true,
        strict: false  // Allow additional fields from PayPal
    }
);

module.exports = mongoose.model('Payment', paymentSchema);