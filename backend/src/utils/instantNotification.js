import { Reminder } from "../models/Reminder.js";

/**
 * In-app notification delivered immediately (no scheduler wait).
 * Reuses Reminder collection; panel shows sent=true OR remindAt <= now.
 */
export async function createInstantNotification({ userId, petId, title, type = "custom" }) {
  const now = new Date();
  return Reminder.create({
    userId,
    petId,
    title: String(title).slice(0, 140),
    type,
    remindAt: now,
    sent: true,
    sentAt: now,
    read: false
  });
}
