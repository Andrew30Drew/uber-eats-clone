const axios = require('axios');
const orderCtrl = require('./orderController');
const CART_URL  = process.env.CART_URL;

// POST /api/payments/checkout
exports.checkout = async (req, res) => {
  const { userId, paymentInfo } = req.body;
  try {
    // 1) Fetch cart
    const cartResp = await axios.get(`${CART_URL}/api/cart/${userId}`);
    const cart     = cartResp.data;
    if (!cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

   // simulate a payment gateway call
exports.processPayment = async ({ userId, amount, paymentMethod }) => {
    console.log(`Processing payment for ${userId}: $${amount} via ${paymentMethod}`);
    // you could call axios to real gateway here
    return { success: true, transactionId: 'txn_' + Date.now() };
  };

    // 3) Create order
    const orderData = {
      userId,
      restaurantId: cart.items[0].restaurantId || 'unknown',
      items: cart.items,
      totalAmount: cart.items.reduce((sum,i)=>sum+i.price*i.quantity,0),
      paymentStatus: 'Paid'
    };
    const order = await orderCtrl.createOrderRecord(orderData);

    // 4) Clear cart
    await axios.delete(`${CART_URL}/api/cart/${userId}`);

    res.json({ payment: paymentResult, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
