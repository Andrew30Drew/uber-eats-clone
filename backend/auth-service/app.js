const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(
      "Attempting to connect to MongoDB at:",
      process.env.MONGODB_URI
    );
    console.log("Connected to MongoDB successfully");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
  console.log("Environment variables:");
  console.log("PORT:", process.env.PORT);
  console.log("MONGODB_URI:", process.env.MONGODB_URI);
});
