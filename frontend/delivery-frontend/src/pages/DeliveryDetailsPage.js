import React from "react";
import { useParams } from "react-router-dom";
import DeliveryDetails from "../components/DeliveryDetails";

const DeliveryDetailsPage = () => {
  const { orderId } = useParams();

  return (
    <div>
      <DeliveryDetails orderId={orderId} />
    </div>
  );
};

export default DeliveryDetailsPage;