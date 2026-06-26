import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const HUB_SERVER_URL = import.meta.env.VITE_HUB_SERVER_URL || "http://localhost:5200";

export const hubClient = axios.create({
  baseURL: HUB_SERVER_URL,
  timeout: 8000,
});

hubClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
