import axios from 'axios';

// Base URLs
const DATA_BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/ai';

// Base config for interceptors
const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Avoid redirect loop if already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

// Create two separate axios instances
const dataApi = setupInterceptors(axios.create({
  baseURL: DATA_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
}));

const aiApiInstance = setupInterceptors(axios.create({
  baseURL: AI_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
}));

// ---------- Auth APIs ----------
export const authAPI = {
  login: (phone, password) =>
    dataApi.post('/auth/login', { phone, password }),

  register: (data) =>
    dataApi.post('/auth/register', data),

  getMe: () =>
    dataApi.get('/auth/me'),
};

// ---------- Transaction APIs ----------
export const transactionAPI = {
  create: (data) =>
    dataApi.post('/transactions', data),

  getToday: () =>
    dataApi.get('/transactions/today'),

  getByDate: (date) =>
    dataApi.get(`/transactions?date=${date}`),

  getRange: (startDate, endDate) =>
    dataApi.get(`/transactions/range?start=${startDate}&end=${endDate}`),

  update: (id, data) =>
    dataApi.put(`/transactions/${id}`, data),

  delete: (id) =>
    dataApi.delete(`/transactions/${id}`),
};

// ---------- Dashboard APIs ----------
export const dashboardAPI = {
  getToday: () =>
    dataApi.get('/dashboard/today'),

  getWeekly: () =>
    dataApi.get('/dashboard/weekly'),

  getUdhaar: () =>
    dataApi.get('/dashboard/udhaar'),

  getRecent: (limit = 5) =>
    dataApi.get(`/dashboard/recent?limit=${limit}`),
};

// ---------- AI APIs ----------
export const aiAPI = {
  parse: (rawInput, language = 'en') =>
    aiApiInstance.post('/parse', { rawInput, language }),

  getDailySummary: (transactions, language = 'en', date = null) =>
    aiApiInstance.post('/daily-summary', { transactions, language, date }),

  getWeeklyInsight: (daily_summaries, language = 'en') =>
    aiApiInstance.post('/weekly-insight', { daily_summaries, language }),
};

export default dataApi;
