import { askGemini } from "../services/chatService.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { assertChatMessage } from "../validators/chat.validator.js";

function sanitizePetData(petData) {
  if (!petData || typeof petData !== "object") return {};

  const safe = {};
  if (typeof petData.name === "string") safe.name = petData.name.slice(0, 80);
  if (typeof petData.breed === "string") safe.breed = petData.breed.slice(0, 80);
  if (typeof petData.petType === "string") safe.petType = petData.petType.slice(0, 20);
  if (typeof petData.ageYears === "number") safe.ageYears = petData.ageYears;
  if (typeof petData.weightKg === "number") safe.weightKg = petData.weightKg;
  if (Array.isArray(petData.medicalHistory)) safe.medicalHistory = petData.medicalHistory.slice(0, 20);
  if (Array.isArray(petData.vaccinationRecords)) safe.vaccinationRecords = petData.vaccinationRecords.slice(0, 20);
  return safe;
}

export async function chat(req, res) {
  const message = assertChatMessage(req.body);
  const { petData } = req.body || {};

  try {
    const result = await askGemini({ message, petData: sanitizePetData(petData) });
    return ok(res, result);
  } catch (err) {
    console.error("chat service error", err);
    throw new HttpError(502, err instanceof Error ? err.message : "Chat service unavailable");
  }
}
