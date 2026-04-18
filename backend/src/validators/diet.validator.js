import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export function assertPetIdParam(petId) {
  if (!petId || !mongoose.isValidObjectId(String(petId))) throw new HttpError(400, "Invalid petId");
}

export function assertDietUpsertBody(body) {
  const petId = body?.petId;
  if (!petId || !mongoose.isValidObjectId(String(petId))) throw new HttpError(400, "petId is required");
  return { petId: String(petId) };
}

export function assertDietDocumentId(id) {
  if (!id || !mongoose.isValidObjectId(String(id))) throw new HttpError(400, "Invalid id");
}
