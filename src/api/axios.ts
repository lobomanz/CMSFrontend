import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../auth/useAuth'; // Assuming zustand store for auth


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      useAuthStore.getState().logout();
      // Using a global navigation hook or context for non-React component files
      // For simplicity here, we'll assume a global navigation function or handle it in components
      // In a real app, you might use a custom hook that leverages navigate from react-router-dom
      window.location.href = '/login'; // Redirect to login page
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
  upload: <T, R>(url: string, data: T) => axiosInstance.post<R>(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data),
};

export default axiosInstance;
