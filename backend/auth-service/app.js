const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
}); 