import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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
  console.log("Health check endpoint called");
  res.status(200).json({
    status: "healthy",
    mongodbStatus: mongoose.connection.readyState,
  });
});

// Mount auth routes
console.log("Mounting auth routes at /auth");
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  console.log("Root endpoint called");
  res.send("Auth Service Running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
  console.log("Environment variables:");
  console.log("PORT:", process.env.PORT);
  console.log("MONGODB_URI:", process.env.MONGODB_URI);
});
