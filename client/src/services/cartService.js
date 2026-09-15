import api from './api';

const getCart = () => api.get('/cart').then((res) => res.data);
const addToCart = (productId, quantity = 1) =>
  api.post('/cart', { productId, quantity }).then((res) => res.data);
const updateCartItem = (productId, quantity) =>
  api.put(`/cart/${productId}`, { quantity }).then((res) => res.data);
const removeCartItem = (productId) => api.delete(`/cart/${productId}`).then((res) => res.data);

export default { getCart, addToCart, updateCartItem, removeCartItem };
