// backend/order-service/middlewares/validate.js
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // send back array of { msg, param, ... }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
