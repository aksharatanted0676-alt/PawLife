import { apiRequest } from "../http/client";
import type { PetConnectMessageRow, PetConnectRequestRow } from "../types";

export const connectService = {
  getConnectRequests: (token: string) =>
    apiRequest<{
      incoming: PetConnectRequestRow[];
      outgoing: PetConnectRequestRow[];
      accepted: PetConnectRequestRow[];
    }>("/pets/connect/requests", undefined, token),

  sendConnectRequest: (token: string, fromPetId: string, toPetId: string) =>
    apiRequest<{ request: PetConnectRequestRow }>(
      "/pets/connect/requests",
      {
        method: "POST",
        body: JSON.stringify({ fromPetId, toPetId })
      },
      token
    ),

  acceptConnectRequest: (token: string, requestId: string) =>
    apiRequest<{ request: PetConnectRequestRow }>(`/pets/connect/requests/${requestId}/accept`, { method: "POST" }, token),

  rejectConnectRequest: (token: string, requestId: string) =>
    apiRequest<{ success: boolean }>(`/pets/connect/requests/${requestId}/reject`, { method: "POST" }, token),

  blockConnectUser: (token: string, userId: string) =>
    apiRequest<{ success: boolean }>("/pets/connect/blocks", { method: "POST", body: JSON.stringify({ userId }) }, token),

  reportConnectUser: (token: string, payload: { userId: string; reason: string; targetPetId?: string }) =>
    apiRequest<{ success: boolean }>("/pets/connect/reports", { method: "POST", body: JSON.stringify(payload) }, token),

  getConnectMessages: (token: string, connectionId: string) =>
    apiRequest<{ messages: PetConnectMessageRow[] }>(`/pets/connect/messages/${connectionId}`, undefined, token),

  postConnectMessage: (token: string, connectionId: string, body: string) =>
    apiRequest<{ message: PetConnectMessageRow }>(
      "/pets/connect/messages",
      {
        method: "POST",
        body: JSON.stringify({ connectionId, body })
      },
      token
    ),

  verifyConnectAccountDemo: (token: string) =>
    apiRequest<{ success: boolean }>("/pets/connect/verify-account-demo", { method: "POST" }, token)
};
