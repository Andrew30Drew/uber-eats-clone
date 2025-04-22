const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Restaurant Service Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Restaurant Service listening on port ${PORT}`);
});
