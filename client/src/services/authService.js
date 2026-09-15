import api from './api';

const register = (data) => api.post('/auth/register', data).then((res) => res.data);
const login = (data) => api.post('/auth/login', data).then((res) => res.data);
const getMe = () => api.get('/auth/me').then((res) => res.data);
const updateMe = (data) => api.put('/auth/me', data).then((res) => res.data);

export default { register, login, getMe, updateMe };
