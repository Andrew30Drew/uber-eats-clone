import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface DeliveryContextType {
  currentDelivery: DeliveryType | null;
  driverLocation: LocationType | null;
  deliveryStatus: string;
  updateDriverLocation: (location: LocationType) => void;
  updateDeliveryStatus: (orderId: string, status: string) => Promise<void>;
  assignDelivery: (orderId: string, restaurantId: string) => Promise<void>;
  getDriverOrders: () => Promise<DeliveryType[]>;
}

interface LocationType {
  type: string;
  coordinates: [number, number];
}

interface DeliveryType {
  _id: string;
  orderId: string;
  driverId: string;
  status: string;
  pickupLocation: LocationType;
  deliveryLocation: LocationType;
  assignedAt: string;
  updatedAt: string;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(
  undefined
);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryType | null>(
    null
  );
  const [driverLocation, setDriverLocation] = useState<LocationType | null>(
    null
  );
  const [deliveryStatus, setDeliveryStatus] = useState<string>("");

  const DELIVERY_SERVICE_URL =
    process.env.REACT_APP_DELIVERY_SERVICE_URL || "http://localhost:3006";

  const updateDriverLocation = (location: LocationType) => {
    setDriverLocation(location);
  };

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(
        `${DELIVERY_SERVICE_URL}/delivery/update-status/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDeliveryStatus(status);
      setCurrentDelivery(response.data);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw error;
    }
  };

  const assignDelivery = async (orderId: string, restaurantId: string) => {
    try {
      const response = await axios.post(
        `${DELIVERY_SERVICE_URL}/delivery/assign/${orderId}`,
        { orderId, restaurantId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCurrentDelivery(response.data);
    } catch (error) {
      console.error("Error assigning delivery:", error);
      throw error;
    }
  };

  const getDriverOrders = async (): Promise<DeliveryType[]> => {
    try {
      const response = await axios.get(
        `${DELIVERY_SERVICE_URL}/delivery/orders/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching driver orders:", error);
      throw error;
    }
  };

  // Watch for geolocation updates if user is a driver
  useEffect(() => {
    if (user?.role === "delivery" && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateDriverLocation({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user]);

  return (
    <DeliveryContext.Provider
      value={{
        currentDelivery,
        driverLocation,
        deliveryStatus,
        updateDriverLocation,
        updateDeliveryStatus,
        assignDelivery,
        getDriverOrders,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error("useDelivery must be used within a DeliveryProvider");
  }
  return context;
};
