const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Payment Service Running");
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Payment Service listening on port ${PORT}`);
});
