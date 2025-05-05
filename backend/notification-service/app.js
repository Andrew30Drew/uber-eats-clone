import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import notifyRoutes from "./routes/notify.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://auth-service:3004",
          "http://restaurant-service:3000",
          "http://delivery-service:3006",
        ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev")); // Request logging

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "notification-service",
  });
});

// Mount routes
app.use("/notify", notifyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: err.message,
    service: "notification-service",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Notification Service listening on port ${PORT}`);
});
