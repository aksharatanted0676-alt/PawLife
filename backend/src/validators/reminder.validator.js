import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

const ALLOWED_TYPES = new Set(["vaccination", "appointment", "medication", "grooming", "custom"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function assertCreateReminderBody(body) {
  const { petId, title, type, remindAt } = body || {};
  if (!petId || !title || !type || !remindAt) {
    throw new HttpError(400, "petId, title, type, and remindAt are required");
  }
  if (!isNonEmptyString(title) || String(title).trim().length > 140) {
    throw new HttpError(400, "Invalid title (max 140 characters)");
  }
  if (!ALLOWED_TYPES.has(String(type))) throw new HttpError(400, "Invalid reminder type");
  const parsed = parseDate(remindAt);
  if (!parsed) throw new HttpError(400, "Invalid remindAt date");
  if (!mongoose.isValidObjectId(String(petId))) throw new HttpError(400, "Invalid petId");
  return {
    petId: String(petId),
    title: String(title).trim(),
    type: String(type),
    remindAt: parsed
  };
}

export function assertReminderId(id) {
  if (!id || !mongoose.isValidObjectId(String(id))) throw new HttpError(400, "Invalid id");
}
