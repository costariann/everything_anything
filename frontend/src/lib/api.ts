import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // In browser, always target backend on port 4000
    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (configured && !configured.includes(':4001/api/v1')) {
      return configured;
    }
    return 'http://localhost:4000/api/v1';
  }
  return process.env.INTERNAL_BACKEND_URL
    ? `${process.env.INTERNAL_BACKEND_URL}/api/v1`
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present and sync dynamic baseURL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      config.baseURL = getApiBaseUrl();
      const token = localStorage.getItem('everythinganything_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default apiClient;
