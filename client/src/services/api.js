import axios from 'axios';

// Single Axios instance shared by every service module.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if the user is logged in) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so components can just read `error.message`.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      // token missing/expired - clear stale auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
