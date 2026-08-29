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
      const data = err.response?.data as
        | { message?: string; error?: string; errors?: Array<{ message?: string }> }
        | undefined;

      // The auth-service runs express-validator on /auth/login and returns
      // { message: "Validation failed", errors: [{ field, message }] }. Surface the
      // specific rule messages instead of the unhelpful "Validation failed" lump.
      const validationDetail = Array.isArray(data?.errors)
        ? data.errors
            .map((e) => (typeof e?.message === "string" ? e.message : ""))
            .filter(Boolean)
            .join(" ")
        : "";

      const rawMessage =
        validationDetail ||
        (data?.message && data.message !== "Validation failed" ? data.message : "") ||
        data?.error ||
        (status === 401 || status === 403
          ? "Invalid credentials"
          : status === 400
            ? "Invalid login request"
            : "Login failed. Please try again.");

      // Cap length as defense-in-depth against an oversized upstream string;
      // the value is rendered verbatim as text in the login form.
      const message = rawMessage.length > 300 ? `${rawMessage.slice(0, 300)}…` : rawMessage;
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
