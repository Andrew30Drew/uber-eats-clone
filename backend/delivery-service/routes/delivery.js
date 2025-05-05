import express from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import {
  assignDelivery,
  getDriverOrders,
  updateDeliveryStatus,
  getDeliveryStatus,
} from "../controllers/delivery.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Protected routes
router.post(
  "/assign/:orderId",
  authenticateJWT,
  requireRole(["admin"]),
  assignDelivery
);

router.get(
  "/orders/:driverId",
  authenticateJWT,
  requireRole(["admin", "delivery"]),
  getDriverOrders
);

router.patch(
  "/update-status/:orderId",
  authenticateJWT,
  requireRole(["admin", "delivery"]),
  updateDeliveryStatus
);

router.get("/status/:orderId", authenticateJWT, getDeliveryStatus);

export default router;
