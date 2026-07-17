import axios from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Platform service URLs — backends live in deepiri-platform, not this repo.
 * - api-gateway (:5100) — auth + proxied APIs
 * - registry (:5003) — service catalog + health aggregation
 * - realtime-gateway (:5008) — live event stream (socket.io)
 */
export const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:5100";

export const REGISTRY_URL =
  import.meta.env.VITE_REGISTRY_URL || "http://localhost:5003";

export const REALTIME_GATEWAY_URL =
  import.meta.env.VITE_REALTIME_GATEWAY_URL || "http://localhost:5008";

function attachAuth(client: ReturnType<typeof axios.create>) {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

/** Auth + general API traffic via api-gateway */
export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 10_000,
});
attachAuth(apiClient);

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

/**
 * Service catalog + health via deepiri-registry.
 * Prefer gateway proxy when available; direct registry URL works in local platform compose.
 */
export const registryClient = axios.create({
  baseURL: REGISTRY_URL,
  timeout: 8_000,
});
attachAuth(registryClient);
