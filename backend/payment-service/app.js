const express = require("express");
const cors = require("cors");
require("dotenv").config();
const paymentRoutes = require('./routes/paymentRoutes');
const authenticateJwt = require('./middlewares/auth')

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.use('/api/payments', paymentRoutes);

app.get("/", (req, res) => {
  res.send("Payment Service Running");
});

app.get('/api/config/paypal', (req, res) => 
  res.send(process.env.PAYPAL_CLIENT_ID)
);



const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Payment Service listening on port ${PORT}`);
});
