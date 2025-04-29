import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const mongoURI = process.env.MONGO_URI; // This matches your `.env` file

// Debug: print env variables
console.log("Environment variables:");
console.log("PORT:", PORT);
console.log("MONGO_URI:", mongoURI);

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
console.log("Attempting to connect to MongoDB at:", mongoURI);
mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    mongodbStatus: mongoose.connection.readyState,
  });
});

// Auth routes
console.log("Mounting auth routes at /auth");
app.use("/auth", authRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
});
