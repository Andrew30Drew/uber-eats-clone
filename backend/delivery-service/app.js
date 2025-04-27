const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const deliveryRoutes = require("./routes/delivery.routes");

// Initialize App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/delivery", deliveryRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Delivery Service is healthy!" });
});

// Default Home Route
app.get("/", (req, res) => {
    res.send("Welcome to the Delivery Service!");
});

// Handle unhandled routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚚 Delivery Service running on port ${PORT}`);
});
