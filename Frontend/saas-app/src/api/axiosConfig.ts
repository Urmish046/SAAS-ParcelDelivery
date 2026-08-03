import axios from 'axios';

// Dynamically resolve the backend URL:
// - If accessed via localhost, hit localhost:3000
// - If accessed via a network IP (e.g. phone testing), hit the same IP on port 3000
// - Falls back to VITE_API_URL env variable if explicitly set
const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:3000`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
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