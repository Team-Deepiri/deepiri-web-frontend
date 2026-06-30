import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:5100";

export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 10000,
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
