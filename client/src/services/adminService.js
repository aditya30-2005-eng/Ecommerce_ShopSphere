import api from './api';

const getStats = () => api.get('/admin/stats').then((res) => res.data);
const getUsers = () => api.get('/admin/users').then((res) => res.data);

const getPromoCodes = () => api.get('/admin/promo-codes').then((res) => res.data);
const createPromoCode = (data) => api.post('/admin/promo-codes', data).then((res) => res.data);
const updatePromoCode = (id, data) => api.put(`/admin/promo-codes/${id}`, data).then((res) => res.data);
const deletePromoCode = (id) => api.delete(`/admin/promo-codes/${id}`).then((res) => res.data);

export default {
  getStats,
  getUsers,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
};
