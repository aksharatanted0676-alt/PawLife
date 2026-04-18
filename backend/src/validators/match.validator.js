import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export function assertPetId(petId, label = "petId") {
  if (!petId || !mongoose.isValidObjectId(String(petId))) throw new HttpError(400, `Invalid ${label}`);
}

export function assertMatchRequestBody(body) {
  const { toPetId, fromPetId } = body || {};
  assertPetId(toPetId, "toPetId");
  assertPetId(fromPetId, "fromPetId");
  return { toPetId: String(toPetId), fromPetId: String(fromPetId), message: String(body?.message ?? "") };
}
