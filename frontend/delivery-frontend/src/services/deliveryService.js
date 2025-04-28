import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3002/api/delivery";

const createDelivery = (deliveryData) =>
  axios.post(API_URL, deliveryData).then((res) => res.data);

const getDelivery = (orderId) =>
  axios.get(`${API_URL}/${orderId}`).then((res) => res.data);

const updateDeliveryStatus = (id, statusData) =>
  axios.patch(`${API_URL}/${id}/status`, statusData).then((res) => res.data);

export default {
  createDelivery,
  getDelivery,
  updateDeliveryStatus,
};
