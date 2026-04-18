import { apiRequest } from "../http/client";
import type { AuthResponse, User } from "../types";

export const authService = {
  signup: (payload: { name: string; email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: (token: string) => apiRequest<{ user: User }>("/auth/me", { method: "GET" }, token)
};
