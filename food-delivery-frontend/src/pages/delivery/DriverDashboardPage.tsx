import React, { useEffect, useState } from "react";
import { useDelivery } from "../../contexts/DeliveryContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { MapPin, Package, Navigation, CheckCircle, Clock } from "lucide-react";

interface DeliveryItem {
  _id: string;
  orderId: string;
  status: string;
  pickupLocation: {
    coordinates: [number, number];
  };
  deliveryLocation: {
    coordinates: [number, number];
  };
  assignedAt: string;
}

const DriverDashboardPage: React.FC = () => {
  const { getDriverOrders, updateDeliveryStatus, driverLocation } =
    useDelivery();
  const { sendNotification } = useNotifications();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const orders = await getDriverOrders();
      setDeliveries(orders);
    } catch (error) {
      console.error("Error loading deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      // Refresh deliveries after status update
      await loadDeliveries();

      // Send notification to customer
      await sendNotification("email", "customer@example.com", {
        subject: "Delivery Status Update",
        message: `Your order status has been updated to: ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-yellow-100 text-yellow-800";
      case "Picked Up":
        return "bg-blue-100 text-blue-800";
      case "On the Way":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            <span>
              Current Location:{" "}
              {driverLocation
                ? `${driverLocation.coordinates[1].toFixed(
                    4
                  )}, ${driverLocation.coordinates[0].toFixed(4)}`
                : "Updating..."}
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No active deliveries</p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Order #{delivery.orderId}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(delivery.assignedAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      Pickup: {delivery.pickupLocation.coordinates.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Navigation className="h-5 w-5 mr-2" />
                    <span>
                      Delivery:{" "}
                      {delivery.deliveryLocation.coordinates.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {delivery.status === "Assigned" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(delivery.orderId, "Picked Up")
                      }
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  {delivery.status === "Picked Up" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(delivery.orderId, "On the Way")
                      }
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Start Delivery
                    </button>
                  )}
                  {delivery.status === "On the Way" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(delivery.orderId, "Delivered")
                      }
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Complete Delivery
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardPage;
