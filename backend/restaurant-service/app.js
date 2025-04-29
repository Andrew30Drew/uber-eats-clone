const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// MongoDB connection
console.log("Attempting to connect to MongoDB at:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGO_URI)
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
