import { Reminder } from "../models/Reminder.js";
import { Pet } from "../models/Pet.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { assertCreateReminderBody, assertReminderId } from "../validators/reminder.validator.js";

export async function listReminders(req, res) {
  const reminders = await Reminder.find({ userId: req.user.userId }).sort({ remindAt: 1 });
  return ok(res, { reminders });
}

export async function createReminder(req, res) {
  const { petId, title, type, remindAt } = assertCreateReminderBody(req.body);

  const pet = await Pet.findOne({ _id: petId, userId: req.user.userId }).select({ _id: 1 });
  if (!pet) throw new HttpError(404, "Pet not found");

  const reminder = await Reminder.create({
    userId: req.user.userId,
    petId,
    title,
    type,
    remindAt
  });
  return ok(res, { reminder }, "Reminder created", 201);
}

export async function markReminderRead(req, res) {
  const { id } = req.params;
  assertReminderId(id);

  const reminder = await Reminder.findOneAndUpdate(
    { _id: id, userId: req.user.userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!reminder) throw new HttpError(404, "Reminder not found");
  return ok(res, { reminder });
}

export async function deleteReminder(req, res) {
  const { id } = req.params;
  assertReminderId(id);

  const deleted = await Reminder.findOneAndDelete({ _id: id, userId: req.user.userId });
  if (!deleted) throw new HttpError(404, "Reminder not found");
  return ok(res, { success: true }, "Reminder deleted");
}
