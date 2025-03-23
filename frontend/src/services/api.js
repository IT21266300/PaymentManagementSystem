import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add retry logic
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s
  retryCondition: (error) => error.code === 'ECONNABORTED' || error.response?.status >= 500,
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      config.headers['user-id'] = user.id;
      config.headers['is-admin'] = user.isAdmin ? 'true' : 'false';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;