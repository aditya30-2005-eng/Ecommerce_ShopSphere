import api from './api';

const getNotifications = () => api.get('/notifications').then((res) => res.data);

export default { getNotifications };
