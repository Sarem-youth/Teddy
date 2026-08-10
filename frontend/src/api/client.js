import axios from 'axios';
import { getApiBaseUrl } from '../utils/appNavigation';

export const TOKEN_KEY = 'teddy_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

export function setStoredToken(token, persistent = true) {
  if (!token) return;

  if (persistent) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Expired/invalid token — clear it (but not for a failed login attempt).
    if (status === 401 && !url.includes('/auth/login')) {
      clearStoredToken();
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly message (first validation error or general message). */
export function apiError(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message || fallback;
}

export default api;
