import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT and market headers dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach active market mode header
    const marketMode = localStorage.getItem('marketMode') || 'B2C';
    config.headers['X-Market-Mode'] = marketMode;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
