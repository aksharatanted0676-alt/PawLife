import type { PetMatchResult, PetProfile } from "./types";
import { authService } from "./services/auth.service";
import { petsService } from "./services/pets.service";
import { dietService } from "./services/diet.service";
import { notificationsService } from "./services/notifications.service";
import { subscriptionService } from "./services/subscription.service";
import { remindersService } from "./services/reminders.service";
import { chatService } from "./services/chat.service";
import { connectService } from "./services/connect.service";

/**
 * Back-compat API surface; implementations live in `lib/services/*` and use the JSON envelope.
 */
export const api = {
  signup: authService.signup,
  login: authService.login,
  getMe: authService.getMe,
  subscribe: subscriptionService.subscribe,
  getDiet: dietService.getDiet,
  saveDiet: dietService.saveDiet,
  updateDiet: dietService.updateDiet,
  deleteDiet: dietService.deleteDiet,
  getPets: petsService.getPets,
  addPet: petsService.addPet,
  updatePet: petsService.updatePet,
  deletePet: petsService.deletePet,
  askChat: chatService.askChat,
  getReminders: remindersService.getReminders,
  addReminder: remindersService.addReminder,
  markReminderRead: remindersService.markReminderRead,
  getNotifications: notificationsService.getNotifications,
  markNotificationRead: notificationsService.markNotificationRead,
  markAllNotificationsRead: notificationsService.markAllNotificationsRead,
  uploadReport: petsService.uploadReport,

  matchPets: async (
    token: string,
    petId: string,
    filters: { maxDistanceKm: number; breed: string; minAge: number; maxAge: number; mode: "social" | "breeding" }
  ) => {
    const response = await fetch("/api/match-pets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ petId, filters }),
      cache: "no-store"
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      missing?: string[];
      message?: string;
      matches?: PetMatchResult[];
      suggestions?: string[];
      mode?: string;
      petType?: string;
    };
    if (!response.ok) {
      const err = new Error(
        typeof data.message === "string" ? data.message : typeof data.error === "string" ? data.error : "Match request failed"
      ) as Error & { code?: string; missing?: string[] };
      err.code = typeof data.error === "string" ? data.error : undefined;
      err.missing = Array.isArray(data.missing) ? data.missing : undefined;
      throw err;
    }
    return data as { matches: PetMatchResult[]; suggestions: string[]; mode: string; petType: string };
  },

  getConnectRequests: connectService.getConnectRequests,
  sendConnectRequest: connectService.sendConnectRequest,
  acceptConnectRequest: connectService.acceptConnectRequest,
  rejectConnectRequest: connectService.rejectConnectRequest,
  blockConnectUser: connectService.blockConnectUser,
  reportConnectUser: connectService.reportConnectUser,
  getConnectMessages: connectService.getConnectMessages,
  postConnectMessage: connectService.postConnectMessage,
  verifyConnectAccountDemo: connectService.verifyConnectAccountDemo
};

export { authService } from "./services/auth.service";
export { petsService } from "./services/pets.service";
export { dietService } from "./services/diet.service";
export { notificationsService } from "./services/notifications.service";
export { subscriptionService } from "./services/subscription.service";
export { remindersService } from "./services/reminders.service";
export { chatService } from "./services/chat.service";
export { connectService } from "./services/connect.service";
export { matchesService } from "./services/matches.service";
