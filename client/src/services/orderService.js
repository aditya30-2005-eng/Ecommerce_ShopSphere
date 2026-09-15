import api from './api';

const createOrder = (data) => api.post('/orders', data).then((res) => res.data);
const getMyOrders = () => api.get('/orders/my').then((res) => res.data);
const getOrderById = (id) => api.get(`/orders/${id}`).then((res) => res.data);
const getAllOrders = (params) => api.get('/orders', { params }).then((res) => res.data);
const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then((res) => res.data);

export default { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
