import cron from "node-cron";
import { Reminder } from "../models/Reminder.js";
import { env } from "../config/env.js";

let started = false;
let running = false;

export function startReminderScheduler() {
  if (started) return;
  started = true;

  if (!env.mongoUri) {
    console.warn("Reminder scheduler disabled: MONGO_URI not configured.");
    return;
  }

  cron.schedule("* * * * *", async () => {
    if (running) return;
    running = true;
    const now = new Date();
    try {
      await Reminder.updateMany(
        {
          remindAt: { $lte: now },
          sent: false
        },
        { $set: { sent: true, sentAt: now } }
      );
    } catch (error) {
      console.error("Reminder scheduler tick failed", error);
    } finally {
      running = false;
    }
  });
}
