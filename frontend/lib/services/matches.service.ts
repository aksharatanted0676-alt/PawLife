import { apiRequest } from "../http/client";

export type MatchProfileDoc = Record<string, unknown>;
export type MatchRequestDoc = Record<string, unknown>;

export const matchesService = {
  upsertProfile: (token: string, body: Record<string, unknown>) =>
    apiRequest<{ profile: MatchProfileDoc }>("/matches/profile", { method: "POST", body: JSON.stringify(body) }, token),

  getSuggestions: (token: string, petId: string) =>
    apiRequest<{ suggestions: MatchProfileDoc[]; message?: string }>(`/matches/suggestions/${petId}`, { method: "GET" }, token),

  sendRequest: (token: string, body: { fromPetId: string; toPetId: string; message?: string }) =>
    apiRequest<{ request: MatchRequestDoc }>("/matches/request", { method: "POST", body: JSON.stringify(body) }, token),

  listRequests: (token: string) =>
    apiRequest<{ incoming: MatchRequestDoc[]; outgoing: MatchRequestDoc[] }>("/matches/requests", { method: "GET" }, token)
};
