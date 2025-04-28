const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const deliveryRoutes = require("./routes/delivery.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/delivery", deliveryRoutes);

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Delivery Service is healthy!" });
});

// Default Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the Delivery Service!");
});

// Handle unhandled routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
