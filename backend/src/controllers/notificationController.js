import mongoose from "mongoose";
import { InAppNotification } from "../models/InAppNotification.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";

export async function listNotifications(req, res) {
  const uid = new mongoose.Types.ObjectId(String(req.user.userId));
  const notifications = await InAppNotification.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await InAppNotification.countDocuments({ userId: uid, read: false });
  return ok(res, { notifications, unreadCount });
}

export async function markNotificationRead(req, res) {
  const uid = new mongoose.Types.ObjectId(String(req.user.userId));
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid notification id");

  const doc = await InAppNotification.findOneAndUpdate({ _id: id, userId: uid }, { $set: { read: true } }, { new: true });
  if (!doc) throw new HttpError(404, "Notification not found");

  const unreadCount = await InAppNotification.countDocuments({ userId: uid, read: false });
  return ok(res, { notification: doc, unreadCount }, "Marked read");
}

export async function markAllNotificationsRead(req, res) {
  const uid = new mongoose.Types.ObjectId(String(req.user.userId));
  await InAppNotification.updateMany({ userId: uid, read: false }, { $set: { read: true } });
  const unreadCount = await InAppNotification.countDocuments({ userId: uid, read: false });
  return ok(res, { unreadCount }, "All marked read");
}
