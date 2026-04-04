import axios from 'axios';

/**
 * When unset: same host as the SPA + :8080 (LAN demo from phone works).
 * For hosted frontend (e.g. Vercel) + separate API, set VITE_API_BASE_URL.
 */
function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
  if (typeof window === 'undefined') return 'http://localhost:8080';
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8080`;
}

const API_BASE = resolveApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dd_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the request was to auth, do not force a redirect/reload, just pass the error
    const originalRequest = error.config;
    const reqPath = String(originalRequest?.url || '');
    const base = String(originalRequest?.baseURL || '');
    const fullUrl = base + reqPath;
    if (fullUrl.includes('/auth/login') || fullUrl.includes('/auth/register') || reqPath.includes('/auth/login') || reqPath.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('dd_token');
      localStorage.removeItem('dd_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
