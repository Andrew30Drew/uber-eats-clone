import React, { useState } from "react";
import deliveryService from "../services/deliveryService";

const DeliveryForm = () => {
  const [orderId, setOrderId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await deliveryService.createDelivery({ orderId, deliveryAddress });
      setMessage("Delivery created successfully!");
    } catch (error) {
      setMessage("Error creating delivery: " + error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Delivery</h2>
      <input
        type="text"
        placeholder="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Delivery Address"
        value={deliveryAddress}
        onChange={(e) => setDeliveryAddress(e.target.value)}
        required
      />
      <button type="submit">Create</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default DeliveryForm;
