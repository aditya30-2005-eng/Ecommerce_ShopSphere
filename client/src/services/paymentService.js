import api from './api';

const createPaymentOrder = (data) => api.post('/payments/create-order', data).then((res) => res.data);
const verifyPayment = (data) => api.post('/payments/verify', data).then((res) => res.data);

export default { createPaymentOrder, verifyPayment };
