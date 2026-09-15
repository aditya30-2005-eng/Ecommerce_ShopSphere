import api from './api';

const applyPromoCode = (code) => api.post('/promo/apply', { code }).then((res) => res.data);

export default { applyPromoCode };
