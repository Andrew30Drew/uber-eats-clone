import express from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { upload, handleUploadError } from "../utils/fileUpload.js";
import {
  createRestaurant,
  updateRestaurant,
  addMenuItem,
  toggleItemAvailability,
  getRestaurants,
  getRestaurant,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/restaurants.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Public routes
router.get("/", getRestaurants);
router.get("/:id", getRestaurant);

// Image upload route - Path is already under /restaurants from app.js mounting
router.post(
  "/upload-image",
  authenticateJWT,
  upload.single("image"),
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        console.error("[ERROR] No image file provided");
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return the file path that can be stored in the database
      const imagePath = `/uploads/${req.file.filename}`;
      console.log(`[DEBUG] Image uploaded successfully: ${imagePath}`);

      res.json({
        success: true,
        imagePath: imagePath,
      });
    } catch (error) {
      console.error("[ERROR] Image upload error:", error);
      res.status(500).json({ error: "Failed to process uploaded image" });
    }
  }
);

// Protected routes (require authentication)
router.post("/", authenticateJWT, createRestaurant);
router.patch("/:id", authenticateJWT, updateRestaurant);
router.post("/:restaurantId/menu", authenticateJWT, addMenuItem);
router.patch(
  "/:restaurantId/menu/:itemId",
  authenticateJWT,
  toggleItemAvailability
);
router.put("/:restaurantId/menu/:itemId", authenticateJWT, updateMenuItem);
router.delete("/:restaurantId/menu/:itemId", authenticateJWT, deleteMenuItem);

export default router;
