import Delivery from "../models/Delivery.js";
import Driver from "../models/Driver.js";
import axios from "axios";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005";
const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || "http://localhost:3000";

// Helper function to get restaurant location
const getRestaurantLocation = async (restaurantId) => {
  try {
    const response = await axios.get(
      `${RESTAURANT_SERVICE_URL}/restaurants/internal/location/${restaurantId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant location:", error);
    throw new Error("Failed to fetch restaurant location");
  }
};

// Helper function to find nearest available driver
const findNearestDriver = async (pickupLocation) => {
  try {
    const drivers = await Driver.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: pickupLocation.coordinates,
          },
          $maxDistance: 10000, // 10km radius
        },
      },
    }).limit(1);

    return drivers[0] || null;
  } catch (error) {
    console.error("Error finding nearest driver:", error);
    return null;
  }
};

// Notify users through notification service
const sendNotification = async (type, recipient, data) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/notify/${type}`, {
      recipient,
      ...data,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    // Don't throw error for notifications - log and continue
  }
};

// Assign delivery personnel to order
export const assignDelivery = async (req, res) => {
  try {
    const { orderId, restaurantId } = req.body;

    if (!orderId || !restaurantId) {
      return res.status(400).json({
        error: "Both orderId and restaurantId are required",
      });
    }

    // Get restaurant location
    const restaurantData = await getRestaurantLocation(restaurantId);
    const pickupLocation = restaurantData.location;

    // Find nearest available driver
    const driver = await findNearestDriver(pickupLocation);
    if (!driver) {
      return res.status(404).json({ error: "No available drivers found" });
    }

    // Create delivery assignment
    const delivery = new Delivery({
      orderId,
      driverId: driver._id,
      pickupLocation,
      deliveryLocation: req.body.deliveryLocation, // Customer's location
    });

    await delivery.save();

    // Update driver availability
    driver.isAvailable = false;
    await driver.save();

    // Notify driver
    await sendNotification("sms", driver.contact, {
      message: `New delivery assignment for order ${orderId} from ${restaurantData.address.street}`,
    });

    res.status(201).json(delivery);
  } catch (error) {
    console.error("Error in assignDelivery:", error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      service: "delivery-service",
    });
  }
};

// Get all orders assigned to a driver
export const getDriverOrders = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Verify the requesting user is the driver
    if (req.user.role !== "admin" && req.user._id !== driverId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const deliveries = await Delivery.find({
      driverId,
      status: { $ne: "Delivered" },
    }).sort({ assignedAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error("Error in getDriverOrders:", error);
    res.status(500).json({
      error: error.message,
      service: "delivery-service",
    });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      !["Assigned", "Picked Up", "On the Way", "Delivered"].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    // Verify the requesting user is the assigned driver
    if (
      req.user.role !== "admin" &&
      req.user._id !== delivery.driverId.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    delivery.status = status;
    await delivery.save();

    // If delivery is completed, make driver available again
    if (status === "Delivered") {
      const driver = await Driver.findById(delivery.driverId);
      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    }

    // Notify customer about status update
    await sendNotification("email", "customer@example.com", {
      subject: "Delivery Status Update",
      message: `Your order status has been updated to: ${status}`,
    });

    res.json(delivery);
  } catch (error) {
    console.error("Error in updateDeliveryStatus:", error);
    res.status(500).json({
      error: error.message,
      service: "delivery-service",
    });
  }
};

// Get delivery status
export const getDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const delivery = await Delivery.findOne({ orderId }).populate(
      "driverId",
      "name contact"
    );

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.json(delivery);
  } catch (error) {
    console.error("Error in getDeliveryStatus:", error);
    res.status(500).json({
      error: error.message,
      service: "delivery-service",
    });
  }
};
