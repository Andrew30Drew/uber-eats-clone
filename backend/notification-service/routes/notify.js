import express from "express";
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Send email notification
router.post("/email", async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({
        error: "Missing required fields: recipient, subject, message",
      });
    }

    const result = await sendEmail({ recipient, subject, message });
    res.json(result);
  } catch (error) {
    console.error("Email notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send SMS notification
router.post("/sms", async (req, res) => {
  try {
    const { recipient, message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({
        error: "Missing required fields: recipient, message",
      });
    }

    const result = await sendSMS({ recipient, message });
    res.json(result);
  } catch (error) {
    console.error("SMS notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
