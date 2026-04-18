import mongoose from "mongoose";
import { Pet } from "../models/Pet.js";
import { DietPlan } from "../models/DietPlan.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { getEffectiveSubscription, maxPetsForTier } from "../services/subscriptionService.js";
import { buildDefaultDietPlan, deriveAgeYearsFromBirthdate } from "../services/dietGenerator.js";
import { notifyInApp } from "../services/notifyInApp.js";
import {
  ALLOWED_GENDER,
  ALLOWED_HEALTH,
  ALLOWED_PET_TYPES,
  ALLOWED_VAX,
  normalizeCreatePetPayload,
  normalizeHistory,
  normalizeLocation,
  normalizeVaccinations
} from "../validators/pet.validator.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumberOrUndefined(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function userObjectId(userId) {
  try {
    return new mongoose.Types.ObjectId(String(userId));
  } catch {
    throw new HttpError(401, "Invalid session");
  }
}

export async function listPets(req, res) {
  const uid = userObjectId(req.user.userId);
  const pets = await Pet.find({ userId: uid }).sort({ createdAt: -1 });
  return ok(res, { pets });
}

export async function getPetById(req, res) {
  const uid = userObjectId(req.user.userId);
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid pet id");
  const pet = await Pet.findOne({ _id: id, userId: uid });
  if (!pet) throw new HttpError(404, "Pet not found");
  return ok(res, { pet });
}

export async function createPet(req, res) {
  const uid = userObjectId(req.user.userId);
  const { effective } = await getEffectiveSubscription(req.user.userId);
  const count = await Pet.countDocuments({ userId: uid });
  const maxPets = maxPetsForTier(effective);
  if (count >= maxPets) {
    throw new HttpError(
      403,
      `Your ${effective} plan allows up to ${maxPets} pet(s). Upgrade to add more.`,
      "PET_LIMIT"
    );
  }

  const fields = normalizeCreatePetPayload(req.body);

  const pet = await Pet.create({
    userId: uid,
    ...fields
  });

  const petPlain = pet.toObject();
  const def = buildDefaultDietPlan(petPlain);
  try {
    await DietPlan.create({
      userId: uid,
      petId: pet._id,
      meals: def.meals,
      calories: def.calories,
      waterIntakeMl: def.waterIntakeMl,
      notes: def.notes,
      planType: def.planType || "auto"
    });
  } catch (e) {
    if (e?.code !== 11000) throw e;
  }

  await notifyInApp({
    userId: uid,
    petId: pet._id,
    title: `Pet added: ${pet.name}`,
    message: "A starter diet plan was generated from species, age, and weight.",
    type: "pet_added"
  });

  return ok(res, { pet }, "Pet created", 201);
}

export async function updatePet(req, res) {
  const uid = userObjectId(req.user.userId);
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid pet id");

  const body = req.body || {};
  const patch = {};

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name)) throw new HttpError(400, "Invalid name");
    patch.name = String(body.name).trim();
  }
  if (body.petType !== undefined) {
    if (!isNonEmptyString(body.petType) || !ALLOWED_PET_TYPES.has(String(body.petType))) {
      throw new HttpError(400, "Invalid petType");
    }
    patch.petType = String(body.petType);
  }
  if (body.breed !== undefined) {
    if (!isNonEmptyString(body.breed)) throw new HttpError(400, "Invalid breed");
    patch.breed = String(body.breed).trim();
  }
  if (body.profileImageUrl !== undefined) {
    patch.profileImageUrl = isNonEmptyString(body.profileImageUrl) ? String(body.profileImageUrl).trim() : "";
  }

  if (body.birthdate !== undefined) {
    if (body.birthdate === null || body.birthdate === "") {
      patch.birthdate = null;
    } else {
      const d = new Date(String(body.birthdate));
      if (Number.isNaN(d.getTime())) throw new HttpError(400, "Invalid birthdate");
      patch.birthdate = d;
      patch.ageYears = deriveAgeYearsFromBirthdate(d);
    }
  }
  const ageYears = toNumberOrUndefined(body.ageYears ?? body.age);
  if (ageYears !== undefined && body.birthdate === undefined) {
    if (ageYears < 0 || ageYears > 100) throw new HttpError(400, "Invalid ageYears");
    patch.ageYears = ageYears;
  }
  const weightKg = toNumberOrUndefined(body.weightKg ?? body.weight);
  if (weightKg !== undefined) {
    if (weightKg < 0 || weightKg > 500) throw new HttpError(400, "Invalid weightKg");
    patch.weightKg = weightKg;
  }

  if (body.medicalHistory !== undefined) {
    if (!Array.isArray(body.medicalHistory)) throw new HttpError(400, "Invalid medicalHistory");
    patch.medicalHistory = normalizeHistory(body.medicalHistory);
  }
  if (body.vaccinationRecords !== undefined) {
    if (!Array.isArray(body.vaccinationRecords)) throw new HttpError(400, "Invalid vaccinationRecords");
    patch.vaccinationRecords = normalizeVaccinations(body.vaccinationRecords);
  }

  if (body.gender !== undefined) {
    const g = String(body.gender);
    if (!ALLOWED_GENDER.has(g)) throw new HttpError(400, "Invalid gender");
    patch.gender = g;
  }
  if (body.healthStatus !== undefined) {
    const h = String(body.healthStatus);
    if (!ALLOWED_HEALTH.has(h)) throw new HttpError(400, "Invalid healthStatus");
    patch.healthStatus = h;
  }
  if (body.vaccinationStatus !== undefined) {
    const v = String(body.vaccinationStatus);
    if (!ALLOWED_VAX.has(v)) throw new HttpError(400, "Invalid vaccinationStatus");
    patch.vaccinationStatus = v;
  }
  const healthScorePatch = toNumberOrUndefined(body.healthScore);
  if (healthScorePatch !== undefined) {
    if (healthScorePatch < 0 || healthScorePatch > 100) throw new HttpError(400, "Invalid healthScore");
    patch.healthScore = healthScorePatch;
  }
  const locPatch = normalizeLocation(body.location);
  if (locPatch !== undefined) {
    const existing = await Pet.findOne({ _id: id, userId: uid }).lean();
    const nextLoc = {
      city: locPatch.city !== undefined ? locPatch.city : existing?.location?.city ?? "",
      lat: locPatch.lat !== undefined ? locPatch.lat : existing?.location?.lat ?? null,
      lng: locPatch.lng !== undefined ? locPatch.lng : existing?.location?.lng ?? null
    };
    patch.location = nextLoc;
  }
  if (body.connectOptIn !== undefined) patch.connectOptIn = Boolean(body.connectOptIn);
  if (body.petConnectVerified !== undefined) patch.petConnectVerified = Boolean(body.petConnectVerified);
  if (body.verifiedBreeder !== undefined) patch.verifiedBreeder = Boolean(body.verifiedBreeder);
  if (body.boostProfile !== undefined) patch.boostProfile = Boolean(body.boostProfile);

  const pet = await Pet.findOneAndUpdate({ _id: id, userId: uid }, { $set: patch }, { new: true });
  if (!pet) throw new HttpError(404, "Pet not found");
  return ok(res, { pet }, "Pet updated");
}

export async function deletePet(req, res) {
  const uid = userObjectId(req.user.userId);
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid pet id");

  const deleted = await Pet.findOneAndDelete({ _id: id, userId: uid });
  if (!deleted) throw new HttpError(404, "Pet not found");
  await DietPlan.deleteMany({ userId: uid, petId: id });
  return ok(res, { success: true }, "Pet deleted");
}

export async function uploadPetReport(req, res) {
  const uid = userObjectId(req.user.userId);
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid pet id");
  if (!req.file) throw new HttpError(400, "file is required");

  const pet = await Pet.findOne({ _id: id, userId: uid });
  if (!pet) throw new HttpError(404, "Pet not found");

  const reportUrl = `/uploads/${req.file.filename}`;
  pet.reports = Array.isArray(pet.reports) ? pet.reports : [];
  pet.reports.unshift(reportUrl);
  await pet.save();

  return ok(res, { reportUrl, pet }, "Report uploaded", 201);
}
