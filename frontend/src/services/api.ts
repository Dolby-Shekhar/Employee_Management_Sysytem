import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/v1`
  : '/api/v1';

// Generic paginated response shape returned by list endpoints.
export interface Paginated<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Shared axios instance with JWT auth interceptor.
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach the JWT token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the token and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data ?? error);
  }
);

export const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'object' && err !== null) {
    const asAny = err as Record<string, unknown>;
    if (typeof asAny.message === 'string') return asAny.message;
  }
  return 'An unexpected error occurred';
};
