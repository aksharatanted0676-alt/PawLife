import { apiRequest } from "../http/client";
import type { User } from "../types";

export const subscriptionService = {
  subscribe: (token: string, plan: "pro" | "elite") =>
    apiRequest<{ user: User }>("/subscribe", { method: "POST", body: JSON.stringify({ plan }) }, token)
};
