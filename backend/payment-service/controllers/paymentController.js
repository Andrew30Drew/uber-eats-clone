const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const axios = require("axios");
const { sendPaymentConfirmation } = require("../services/emailService");

// Capture PayPal payment details
const capturePayPalDetails = async (req, res) => {
  try {
    const {
      paypalOrderId, restaurantOrderId, payerName,
      amount, currency, paymentDetails,
    } = req.body;
    if (
      !paypalOrderId || !restaurantOrderId || !payerName ||
      !amount || !currency || !paymentDetails
    ) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    // Create and save payment
    const newPayment = new Payment({
      customerId: req.user?.id,
      restaurantOrderId,
      paypalOrderId,
      payerName,
      amount,
      currency,
      paymentDetails,
      paidAt: new Date(),
    });

    // await newPayment.validate();
    await newPayment.save();
    const paymentID = newPayment._id;

    // Attempt to fetch user email and send confirmation
    try {
      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : authHeader;

      const userResponse = await axios.get(
        `http://localhost:3004/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (!userResponse.data) {
        throw new Error("No data received from auth service");
      }
      if (!userResponse.data?.data?.email) {
        throw new Error("Email not found in user data");
      }

      // emails details
      const userEmail = userResponse.data.data.email;
      const userName = userResponse.data.data.first_name + " " + userResponse.data.data.last_name;
      const emailSent = await sendPaymentConfirmation(userEmail, {
        paymentID,
        customerId: req.user?.id,
        userName,
        restaurantOrderId,
        amount,
        currency,
        paidAt: newPayment.paidAt,
        paypalOrderId,
      });

      if (!emailSent) {
        return res.status(201).json({
          message: "Payment recorded, but email notification failed",
        });
      }
      return res.status(201).json({
        message: "Payment recorded and email sent successfully",
      });

    } catch (emailErr) {
      return res.status(201).json({
        message: "Payment recorded, but email notification failed", error: emailErr.message,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// PayPal - get all Paypal details
const getAllPayments = async (req, res) => {
  try {
    // Verify if the user is an admin
    if (req.user?.role !== "restaurant_owner") {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    // Fetch all payments
    const payments = await Payment.find().sort({ paidAt: -1 });
    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }

    // Fetch user details for each payment
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          const userResponse = await axios.get(
            `http://localhost:3004/api/auth/${payment.customerId}`, // Fetch user details by customerId
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          );

          if (userResponse.data && userResponse.data.data) {
            const user = userResponse.data.data;
            return {
              ...payment._doc, // Include payment details
              customerFirstName: user.first_name,
              customerLastName: user.last_name,
            };
          }
        } catch (err) {
          console.error(`Failed to fetch user details for customerId: ${payment.customerId}`, err.message);
          return {
            ...payment._doc, // Include payment details
            customerFirstName: "Unknown",
            customerLastName: "Unknown",
          };
        }
      })
    );

    res.status(200).json({ payments: enrichedPayments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PayPal - delete payment details from sys admin
const deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Verify if the user is an admin
    if (req.user?.role !== "restaurant_owner") {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  capturePayPalDetails, //check
  getAllPayments, //check
  deletePayment, //check
};
