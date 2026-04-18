import { HttpError } from "../utils/httpError.js";
import { deriveAgeYearsFromBirthdate } from "../services/dietGenerator.js";

export const ALLOWED_PET_TYPES = new Set(["dog", "cat", "bird", "rabbit", "fish"]);
export const ALLOWED_GENDER = new Set(["male", "female", "unknown"]);
export const ALLOWED_HEALTH = new Set(["healthy", "under_observation", "critical"]);
export const ALLOWED_VAX = new Set(["up_to_date", "pending"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumberOrUndefined(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeHistory(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => ({
    date: String(e?.date || ""),
    note: String(e?.note || ""),
    type: e?.type
  }));
}

export function normalizeVaccinations(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => ({
    vaccine: String(e?.vaccine || ""),
    dueDate: String(e?.dueDate || ""),
    status: e?.status
  }));
}

export function normalizeLocation(body) {
  if (!body || typeof body !== "object") return undefined;
  const city = body.city !== undefined ? String(body.city).trim() : undefined;
  const lat = toNumberOrUndefined(body.lat);
  const lng = toNumberOrUndefined(body.lng);
  const out = {};
  if (city !== undefined) out.city = city;
  if (lat !== undefined) out.lat = lat;
  if (lng !== undefined) out.lng = lng;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Validates and normalizes fields for Pet.create from request body.
 */
export function normalizeCreatePetPayload(body) {
  const b = body || {};
  const name = b.name;
  const petType = b.petType;
  const breed = b.breed;
  const profileImageUrl = b.profileImageUrl;

  let birthdate = null;
  if (b.birthdate != null && String(b.birthdate).trim() !== "") {
    const d = new Date(String(b.birthdate));
    if (!Number.isNaN(d.getTime())) birthdate = d;
  }

  let ageYears = toNumberOrUndefined(b.ageYears ?? b.age);
  if (birthdate) ageYears = deriveAgeYearsFromBirthdate(birthdate);
  const weightKg = toNumberOrUndefined(b.weightKg ?? b.weight);

  if (!isNonEmptyString(name) || !isNonEmptyString(breed) || !isNonEmptyString(petType)) {
    throw new HttpError(400, "name, petType, and breed are required");
  }
  if (!ALLOWED_PET_TYPES.has(String(petType))) throw new HttpError(400, "Invalid petType");
  if (ageYears !== undefined && (ageYears < 0 || ageYears > 100)) throw new HttpError(400, "Invalid ageYears");
  if (weightKg !== undefined && (weightKg < 0 || weightKg > 500)) throw new HttpError(400, "Invalid weightKg");

  const gender = b.gender !== undefined ? String(b.gender) : "unknown";
  if (!ALLOWED_GENDER.has(gender)) throw new HttpError(400, "Invalid gender");
  const healthStatus = b.healthStatus !== undefined ? String(b.healthStatus) : "healthy";
  if (!ALLOWED_HEALTH.has(healthStatus)) throw new HttpError(400, "Invalid healthStatus");
  const vaccinationStatus = b.vaccinationStatus !== undefined ? String(b.vaccinationStatus) : "pending";
  if (!ALLOWED_VAX.has(vaccinationStatus)) throw new HttpError(400, "Invalid vaccinationStatus");
  const healthScore = toNumberOrUndefined(b.healthScore);
  if (healthScore !== undefined && (healthScore < 0 || healthScore > 100)) {
    throw new HttpError(400, "Invalid healthScore");
  }
  const loc = normalizeLocation(b.location);
  const connectOptIn = b.connectOptIn === true || b.connectOptIn === "true";
  const petConnectVerified = b.petConnectVerified === true || b.petConnectVerified === "true";
  const verifiedBreeder = b.verifiedBreeder === true || b.verifiedBreeder === "true";
  const boostProfile = b.boostProfile === true || b.boostProfile === "true";

  return {
    name: String(name).trim(),
    petType: String(petType),
    breed: String(breed).trim(),
    birthdate,
    ageYears: ageYears ?? 1,
    weightKg: weightKg ?? 1,
    gender,
    healthStatus,
    vaccinationStatus,
    location: loc ? { city: loc.city ?? "", lat: loc.lat ?? null, lng: loc.lng ?? null } : { city: "", lat: null, lng: null },
    healthScore: healthScore ?? 0,
    connectOptIn,
    petConnectVerified,
    verifiedBreeder,
    boostProfile,
    profileImageUrl: isNonEmptyString(profileImageUrl) ? String(profileImageUrl).trim() : "",
    medicalHistory: normalizeHistory(b.medicalHistory),
    vaccinationRecords: normalizeVaccinations(b.vaccinationRecords)
  };
}
