import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDelivery } from "../../contexts/DeliveryContext";
import {
  MapPin,
  Package,
  Navigation,
  CheckCircle,
  Clock,
  Phone,
} from "lucide-react";

interface DriverInfo {
  name: string;
  contact: string;
}

const DeliveryTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentDelivery, driverLocation } = useDelivery();
  const [isLoading, setIsLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);

  const statusSteps = ["Assigned", "Picked Up", "On the Way", "Delivered"];
  const currentStepIndex = statusSteps.indexOf(
    currentDelivery?.status || "Assigned"
  );

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch driver info from the backend
        setDriverInfo({
          name: "John Doe",
          contact: "+1234567890",
        });
      } catch (error) {
        console.error("Error fetching delivery details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [orderId]);

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
        <div className="max-w-3xl mx-auto">
          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6">
              Tracking Order #{orderId}
            </h1>

            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-0 inset-y-0 w-1 bg-gray-200 rounded"></div>
              {statusSteps.map((step, index) => (
                <div key={step} className="relative pl-8 pb-8 last:pb-0">
                  <div
                    className={`absolute left-0 w-4 h-4 -ml-2 rounded-full border-2 ${
                      index <= currentStepIndex
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                  ></div>
                  <div className="flex items-center">
                    <span
                      className={`font-medium ${
                        index <= currentStepIndex
                          ? "text-primary"
                          : "text-gray-500"
                      }`}
                    >
                      {step}
                    </span>
                    {index <= currentStepIndex && (
                      <span className="ml-2 text-sm text-gray-500">
                        {index === currentStepIndex ? "(Current)" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Info Card */}
          {driverInfo && currentDelivery?.status !== "Delivered" && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Delivery Driver</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{driverInfo.name}</p>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{driverInfo.contact}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${driverInfo.contact}`}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Call Driver
                </a>
              </div>
            </div>
          )}

          {/* Location Info */}
          {driverLocation && currentDelivery?.status !== "Delivered" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Live Location</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    Driver's Location:{" "}
                    {driverLocation.coordinates[1].toFixed(4)},
                    {driverLocation.coordinates[0].toFixed(4)}
                  </span>
                </div>
                {/* Here you would integrate with a mapping service like Google Maps */}
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map View</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingPage;
