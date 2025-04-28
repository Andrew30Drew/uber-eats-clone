import React, { useState } from "react";
import deliveryService from "../services/deliveryService";

const UpdateDeliveryStatus = ({ deliveryId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);

  const handleStatusUpdate = async () => {
    try {
      await deliveryService.updateDeliveryStatus(deliveryId, { status });
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div>
      <h3>Update Delivery Status</h3>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button onClick={handleStatusUpdate}>Update Status</button>
    </div>
  );
};

export default UpdateDeliveryStatus;