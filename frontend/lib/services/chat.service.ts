import { apiRequest } from "../http/client";
import type { ChatResponse, PetProfile } from "../types";

export const chatService = {
  askChat: (token: string, message: string, petData: Partial<PetProfile>) =>
    apiRequest<ChatResponse>(
      "/chat",
      {
        method: "POST",
        body: JSON.stringify({ message, petData })
      },
      token
    )
};
