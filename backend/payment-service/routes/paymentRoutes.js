const express = require('express');
const router = express.Router();
const { capturePayPalDetails, getAllPayments, deletePayment } = require('../controllers/paymentController');
const { verifyToken, verifyRole } = require('../middlewares/auth'); //check



// paypal payment details capture
router.post('/paypalDetails', verifyToken, capturePayPalDetails); //check
router.get('/all', verifyToken, verifyRole(['systemAdmin']), getAllPayments);
router.delete('/:id', verifyToken, verifyRole(['systemAdmin']), deletePayment);

module.exports = router;