import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use(
  (config) => {
    const pathname = window.location.pathname;
    
    let tokenKey = 'admin_token'; 
    
    if (pathname.startsWith('/super-admin')) {
      tokenKey = 'super_admin_token';
    } else if (pathname.startsWith('/customer')) {
      tokenKey = 'customer_token';
    }

    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;