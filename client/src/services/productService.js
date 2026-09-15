import api from './api';

const getProducts = (params) => api.get('/products', { params }).then((res) => res.data);
const getProductById = (id) => api.get(`/products/${id}`).then((res) => res.data);
const createProduct = (data) => api.post('/products', data).then((res) => res.data);
const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((res) => res.data);
const deleteProduct = (id) => api.delete(`/products/${id}`).then((res) => res.data);
const getReviews = (id) => api.get(`/products/${id}/reviews`).then((res) => res.data);
const addReview = (id, data) => api.post(`/products/${id}/reviews`, data).then((res) => res.data);

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviews,
  addReview,
};
