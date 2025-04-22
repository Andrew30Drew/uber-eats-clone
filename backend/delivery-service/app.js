const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Delivery Service Running");
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Delivery Service listening on port ${PORT}`);
});
