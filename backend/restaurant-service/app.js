import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import restaurantRoutes from "./routes/restaurants.js";

dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  next();
});

// Configure CORS to allow specific origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3005",
      "http://localhost:3006",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Serve static files from the uploads folder
const uploadPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadPath));
console.log(`[DEBUG] Serving static files from: ${uploadPath}`);

// Add a route to check if uploads are accessible
app.get("/uploads-check", (req, res) => {
  console.log("[DEBUG] Checking uploads directory:", uploadPath);
  res.json({
    uploadsPath: uploadPath,
    message:
      "If you can see this, the uploads endpoint is configured correctly",
  });
});

// MongoDB connection
console.log("Attempting to connect to MongoDB at:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  });

// Mount restaurant routes
console.log("[DEBUG] Mounting restaurant routes");
app.use("/restaurants", restaurantRoutes);
console.log("[DEBUG] Restaurant routes mounted");

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Restaurant Service listening on port ${PORT}`);
});
