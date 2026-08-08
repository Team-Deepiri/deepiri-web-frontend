import axios from "axios";
import { apiClient, clearAuthToken } from "./platformClient";
import { useAuthStore } from "@/store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

export class AuthError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function login(payload: LoginPayload) {
  try {
    const res = await apiClient.post("/api/auth/login", payload);
    const { user, token } = res.data;
    useAuthStore.getState().setAuth(user, token);
    return { user, token };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message =
        (err.response?.data as { message?: string; error?: string } | undefined)?.message ||
        (err.response?.data as { message?: string; error?: string } | undefined)?.error ||
        (status === 401 || status === 403
          ? "Invalid credentials"
          : status === 400
            ? "Invalid login request"
            : "Login failed. Please try again.");
      throw new AuthError(message, status);
    }
    throw new AuthError("Login failed. Please try again.");
  }
}

/**
 * Clears auth state and API client tokens.
 * Callers on protected routes rely on AuthGuard to Navigate to /login
 * (SPA navigation — no full page reload).
 */
export function logout() {
  useAuthStore.getState().logout();
  clearAuthToken();
}
