import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api', // adjust if your backend runs elsewhere
});

export const CartAPI = {
  getCart: userId => API.get(`/cart/${userId}/items`),
  addItem: (userId, item) => API.post(`/cart/${userId}/items`, item),
  removeItem: (userId, itemId) => API.delete(`/cart/${userId}/items/${itemId}`),
  clearCart: userId => API.delete(`/cart/${userId}/clear`),
};

export const OrdersAPI = {
  list: () => API.get('/orders'),
  create: orderData => API.post('/orders', orderData),
  cancel: orderId => API.delete(`/orders/${orderId}`),
};
