import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------- Auth APIs ----------
export const authAPI = {
  login: (phone, password) =>
    api.post('/auth/login', { phone, password }),

  register: (data) =>
    api.post('/auth/register', data),

  getMe: () =>
    api.get('/auth/me'),
};

// ---------- Transaction APIs ----------
export const transactionAPI = {
  create: (data) =>
    api.post('/transactions', data),

  getToday: () =>
    api.get('/transactions/today'),

  getByDate: (date) =>
    api.get(`/transactions?date=${date}`),

  getRange: (startDate, endDate) =>
    api.get(`/transactions/range?start=${startDate}&end=${endDate}`),

  update: (id, data) =>
    api.put(`/transactions/${id}`, data),

  delete: (id) =>
    api.delete(`/transactions/${id}`),
};

// ---------- Dashboard APIs ----------
export const dashboardAPI = {
  getToday: () =>
    api.get('/dashboard/today'),

  getWeekly: () =>
    api.get('/dashboard/weekly'),

  getUdhaar: () =>
    api.get('/dashboard/udhaar'),
};

// ---------- AI APIs ----------
export const aiAPI = {
  parse: (rawInput, language = 'en') =>
    api.post('/ai/parse', { rawInput, language }),

  getDailySummary: (date) =>
    api.get(`/ai/daily-summary?date=${date}`),

  getWeeklyInsight: () =>
    api.get('/ai/weekly-insight'),
};

export default api;
