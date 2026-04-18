import mongoose from "mongoose";
import { DietPlan } from "../models/DietPlan.js";
import { Pet } from "../models/Pet.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { assertPetIdParam } from "../validators/diet.validator.js";
import { getEffectiveSubscription, maxDietMealsForTier } from "../services/subscriptionService.js";
import { buildDefaultDietPlan } from "../services/dietGenerator.js";
import { notifyInApp } from "../services/notifyInApp.js";

function normalizeMeals(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => ({
      day: m?.day != null ? String(m.day).trim() : "",
      morning: m?.morning != null ? String(m.morning).trim() : "",
      afternoon: m?.afternoon != null ? String(m.afternoon).trim() : "",
      evening: m?.evening != null ? String(m.evening).trim() : "",
      label: m?.label != null ? String(m.label).trim() : "",
      time: m?.time != null ? String(m.time).trim() : "",
      calories: m?.calories != null && m.calories !== "" ? Number(m.calories) : null
    }))
    .filter((row) => {
      if (row.day || row.morning || row.afternoon || row.evening) return true;
      return row.label.length > 0;
    });
}

async function assertPetOwned(petId, userId) {
  return Pet.findOne({ _id: petId, userId }).lean();
}

async function ensureDietDocument(userId, pet) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const pid = pet._id;
  let doc = await DietPlan.findOne({ userId: uid, petId: pid });
  if (doc) return doc;

  const def = buildDefaultDietPlan(pet);
  try {
    doc = await DietPlan.create({
      userId: uid,
      petId: pid,
      meals: def.meals,
      calories: def.calories,
      waterIntakeMl: def.waterIntakeMl,
      notes: def.notes,
      planType: def.planType || "auto"
    });
  } catch (e) {
    if (e && e.code === 11000) {
      doc = await DietPlan.findOne({ userId: uid, petId: pid });
    } else {
      throw e;
    }
  }
  return doc;
}

export async function getDietForPet(req, res) {
  const { petId } = req.params;
  assertPetIdParam(petId);

  const pet = await assertPetOwned(petId, req.user.userId);
  if (!pet) throw new HttpError(404, "Pet not found");

  const diet = await ensureDietDocument(req.user.userId, pet);
  return ok(res, { diet });
}

export async function upsertDiet(req, res) {
  const body = req.body || {};
  const petId = body.petId;
  if (!petId || !mongoose.isValidObjectId(String(petId))) {
    throw new HttpError(400, "petId is required");
  }

  const pet = await assertPetOwned(petId, req.user.userId);
  if (!pet) throw new HttpError(404, "Pet not found");

  const { effective } = await getEffectiveSubscription(req.user.userId);
  if (effective === "free") {
    throw new HttpError(403, "Diet customization requires Pro or Elite.", "SUBSCRIPTION_REQUIRED");
  }

  const maxMeals = maxDietMealsForTier(effective);
  const meals = normalizeMeals(body.meals);
  if (meals.length > maxMeals) {
    throw new HttpError(400, `Your plan allows up to ${maxMeals} meal rows.`, "DIET_LIMIT");
  }

  let notes = body.notes != null ? String(body.notes).slice(0, 2000) : "";
  let calories = body.calories != null ? Number(body.calories) : 0;
  if (!Number.isFinite(calories) || calories < 0 || calories > 50000) {
    throw new HttpError(400, "Invalid calories");
  }

  let waterIntakeMl = body.waterIntakeMl != null ? Number(body.waterIntakeMl) : undefined;
  if (waterIntakeMl !== undefined) {
    if (effective !== "elite") {
      throw new HttpError(403, "Editing water intake targets requires Elite.", "SUBSCRIPTION_REQUIRED");
    }
    if (!Number.isFinite(waterIntakeMl) || waterIntakeMl < 0 || waterIntakeMl > 100000) {
      throw new HttpError(400, "Invalid waterIntakeMl");
    }
  }

  const setDoc = {
    meals,
    notes,
    calories,
    planType: "custom"
  };
  if (waterIntakeMl !== undefined) setDoc.waterIntakeMl = waterIntakeMl;

  const doc = await DietPlan.findOneAndUpdate(
    { userId: req.user.userId, petId },
    { $set: setDoc },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await notifyInApp({
    userId: req.user.userId,
    petId,
    title: `Diet plan updated for ${pet.name}`,
    message: "Your saved meal plan was updated.",
    type: "diet_updated"
  });

  return ok(res, { diet: doc }, "Diet saved", 201);
}

export async function updateDietById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid id");

  const existing = await DietPlan.findOne({ _id: id, userId: req.user.userId });
  if (!existing) throw new HttpError(404, "Diet plan not found");

  const { effective } = await getEffectiveSubscription(req.user.userId);
  if (effective === "free") {
    throw new HttpError(403, "Diet customization requires Pro or Elite.", "SUBSCRIPTION_REQUIRED");
  }

  const maxMeals = maxDietMealsForTier(effective);
  const body = req.body || {};
  const patch = {};

  if (body.meals !== undefined) {
    const meals = normalizeMeals(body.meals);
    if (meals.length > maxMeals) {
      throw new HttpError(400, `Your plan allows up to ${maxMeals} meal rows.`, "DIET_LIMIT");
    }
    patch.meals = meals;
    patch.planType = "custom";
  }
  if (body.notes !== undefined) {
    patch.notes = String(body.notes).slice(0, 2000);
  }
  if (body.calories !== undefined) {
    const c = Number(body.calories);
    if (!Number.isFinite(c) || c < 0 || c > 50000) throw new HttpError(400, "Invalid calories");
    patch.calories = c;
  }
  if (body.waterIntakeMl !== undefined) {
    if (effective !== "elite") {
      throw new HttpError(403, "Editing water intake targets requires Elite.", "SUBSCRIPTION_REQUIRED");
    }
    const w = Number(body.waterIntakeMl);
    if (!Number.isFinite(w) || w < 0 || w > 100000) throw new HttpError(400, "Invalid waterIntakeMl");
    patch.waterIntakeMl = w;
  }

  Object.assign(existing, patch);
  await existing.save();

  const pet = await Pet.findById(existing.petId).select("name").lean();
  await notifyInApp({
    userId: req.user.userId,
    petId: existing.petId,
    title: `Diet plan saved for ${pet?.name || "your pet"}`,
    message: "Meal plan changes were saved.",
    type: "diet_updated"
  });

  return ok(res, { diet: existing }, "Diet updated");
}

export async function deleteDiet(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid id");

  const { effective } = await getEffectiveSubscription(req.user.userId);
  if (effective === "free") {
    throw new HttpError(403, "Removing custom diet requires Pro or Elite.", "SUBSCRIPTION_REQUIRED");
  }

  const deleted = await DietPlan.findOneAndDelete({ _id: id, userId: req.user.userId });
  if (!deleted) throw new HttpError(404, "Diet plan not found");

  return ok(res, { success: true }, "Diet deleted");
}
