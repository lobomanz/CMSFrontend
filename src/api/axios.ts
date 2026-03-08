import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../auth/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7123';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Attempt to get token from store first, then localStorage as fallback
    let token = useAuthStore.getState().token;
    
    if (!token) {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.state?.token;
        } catch (e) {
          console.error("Error parsing auth-storage", e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No auth token found for request:", config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized - redirecting to login");
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API functions
export const api = {
  get: <T>(url: string) => axiosInstance.get<T>(url).then(res => res.data),
  getList: <T>(url: string) => axiosInstance.get<T[]>(url).then(res => res.data),
  getOne: <T>(url: string, id: string | number) => axiosInstance.get<T>(`${url}/${id}`).then(res => res.data),
  create: <T, R>(url: string, data: T) => axiosInstance.post<R>(url, data).then(res => res.data),
  update: <T, R>(url: string, id: string | number, data: T) => axiosInstance.put<R>(`${url}/${id}`, data).then(res => res.data),
  remove: (url: string, id: string | number) => axiosInstance.delete(`${url}/${id}`).then(res => res.data),
  // Fixed upload helper to use axiosInstance properly without overwriting essential headers
  upload: <T, R>(url: string, data: T) => axiosInstance.post<R>(url, data, {
    // Let axios set the boundary for multipart/form-data automatically
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data),
};

export default axiosInstance;
