import axios from 'axios';

// When deployed on Vercel as a single fullstack app, API calls use relative '/api'
// If frontend & backend are deployed as separate Vercel projects, set VITE_API_URL in Vercel env
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // In production (Vercel fullstack), default to relative /api
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const getOriginUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '').replace(/\/api$/, '');
  }
  if (import.meta.env.PROD) {
    return '';
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

export const donorApi = {
  getAll: (search = '') => api.get(`/donors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getOne: (id) => api.get(`/donors/${id}`),
  create: (data) => api.post('/donors', data),
  update: (id, data) => api.put(`/donors/${id}`, data),
  delete: (id) => api.delete(`/donors/${id}`),
};

export const receiptApi = {
  getAll: (params = {}) => api.get('/receipts', { params }),
  getOne: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  downloadUrl: (id) => `${getOriginUrl()}/api/receipts/${id}/download`,
  viewUrl: (id) => `${getOriginUrl()}/api/receipts/${id}/view`,
  sendWhatsApp: (id) => api.post(`/receipts/${id}/send-whatsapp`),
  getStats: () => api.get('/receipts/stats/overview'),
};

export default api;
