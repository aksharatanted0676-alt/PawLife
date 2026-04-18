import { apiRequest } from "../http/client";
import type { Reminder } from "../types";

export const remindersService = {
  getReminders: (token: string) => apiRequest<{ reminders: Reminder[] }>("/reminders", undefined, token),
  addReminder: (token: string, reminder: { petId: string; title: string; type: Reminder["type"]; remindAt: string }) =>
    apiRequest<{ reminder: Reminder }>("/reminders", { method: "POST", body: JSON.stringify(reminder) }, token),
  markReminderRead: (token: string, reminderId: string) =>
    apiRequest<{ reminder: Reminder }>(`/reminders/${reminderId}/read`, { method: "PATCH" }, token)
};
