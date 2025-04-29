const express = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const payment = require('../controllers/paymentController');
const router = express.Router();

router.post(
  '/process',
  [ body('userId').notEmpty(), body('amount').isNumeric(), body('paymentMethod').notEmpty()],
  handleValidationErrors,
  async (req,res) => {
    const result = await payment.processPayment(req.body);
    res.json(result);
  }
);

module.exports = router;
