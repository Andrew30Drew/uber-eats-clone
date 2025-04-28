import React, { useState, useEffect } from "react";
import deliveryService from "../services/deliveryService";

const DeliveryDetails = ({ orderId }) => {
  const [delivery, setDelivery] = useState(null);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const data = await deliveryService.getDelivery(orderId);
        setDelivery(data);
      } catch (error) {
        console.error("Error fetching delivery:", error);
      }
    };
    fetchDelivery();
  }, [orderId]);

  if (!delivery) return <p>Loading...</p>;

  return (
    <div>
      <h2>Delivery Details</h2>
      <p>Order ID: {delivery.orderId}</p>
      <p>Address: {delivery.deliveryAddress}</p>
      <p>Status: {delivery.status}</p>
    </div>
  );
};

export default DeliveryDetails;
