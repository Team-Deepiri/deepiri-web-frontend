import { apiClient } from "./apiClient";
import { useAuthStore } from "@/store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const res = await apiClient.post("/auth/login", payload);
  const { user, token } = res.data;
  useAuthStore.getState().setAuth(user, token);
  return { user, token };
}

export function logout() {
  useAuthStore.getState().logout();
  window.location.href = "/login";
}
