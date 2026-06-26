/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Creates an Axios instance with a predefined base URL.
 * Auth token is read from localStorage (key: 'pz_token') and
 * injected as `Authorization: Bearer <token>` on every request.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
axiosInstance.interceptors.request.use(
  (config: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pz_token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ── Response interceptor: handle errors globally ──────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          // Token expired or missing — clear stored token and redirect to login if on dashboard
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pz_token');
            if (window.location.pathname.startsWith('/dashboard')) {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper type for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

// Helper type for API errors
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
