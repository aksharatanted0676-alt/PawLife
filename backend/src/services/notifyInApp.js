import mongoose from "mongoose";
import { InAppNotification } from "../models/InAppNotification.js";

/**
 * Creates a user-visible notification row (bell / panel).
 */
export async function notifyInApp({ userId, petId, title, message = "", type = "system" }) {
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const pid =
    petId == null || petId === ""
      ? null
      : typeof petId === "string"
        ? new mongoose.Types.ObjectId(petId)
        : petId;

  return InAppNotification.create({
    userId: uid,
    petId: pid,
    title: String(title).slice(0, 200),
    message: String(message).slice(0, 2000),
    type,
    read: false
  });
}
