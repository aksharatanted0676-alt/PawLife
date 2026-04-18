import mongoose from "mongoose";
import { Pet } from "../models/Pet.js";
import { MatchProfile } from "../models/MatchProfile.js";
import { MatchRequest } from "../models/MatchRequest.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { assertMatchRequestBody, assertPetId } from "../validators/match.validator.js";

function userOid(userId) {
  return new mongoose.Types.ObjectId(String(userId));
}

export async function upsertMatchProfile(req, res) {
  const body = req.body || {};
  assertPetId(body.petId, "petId");

  const pet = await Pet.findOne({ _id: body.petId, userId: req.user.userId }).lean();
  if (!pet) throw new HttpError(404, "Pet not found");

  const profile = await MatchProfile.findOneAndUpdate(
    { petId: pet._id },
    {
      $set: {
        userId: userOid(req.user.userId),
        petId: pet._id,
        petType: pet.petType,
        breed: String(body.breed ?? pet.breed).slice(0, 120),
        ageYears: Number(body.ageYears ?? pet.ageYears) || pet.ageYears,
        gender: body.gender != null ? String(body.gender) : pet.gender,
        vaccinationStatus:
          body.vaccinationStatus != null ? String(body.vaccinationStatus) : pet.vaccinationStatus || "pending",
        healthStatus: body.healthStatus != null ? String(body.healthStatus) : "healthy",
        locationCity: String(body.locationCity ?? "").slice(0, 120),
        intent: ["breeding", "companion", "playdate"].includes(String(body.intent)) ? body.intent : "companion",
        description: String(body.description ?? "").slice(0, 2000),
        isActive: body.isActive !== false
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return ok(res, { profile }, "Match profile saved", 201);
}

export async function getSuggestionsForPet(req, res) {
  const { petId } = req.params;
  assertPetId(petId);

  const pet = await Pet.findOne({ _id: petId, userId: req.user.userId }).lean();
  if (!pet) throw new HttpError(404, "Pet not found");

  const mine = await MatchProfile.findOne({ petId: pet._id, isActive: true }).lean();
  if (!mine) {
    return ok(res, {
      suggestions: [],
      message: "Create a match profile for this pet first."
    });
  }

  const ageMin = Math.max(0, mine.ageYears - 3);
  const ageMax = Math.min(40, mine.ageYears + 3);

  const genderFilter =
    mine.intent === "breeding" && mine.gender === "male"
      ? { gender: "female" }
      : mine.intent === "breeding" && mine.gender === "female"
        ? { gender: "male" }
        : {};

  const cityFilter =
    mine.locationCity && String(mine.locationCity).trim()
      ? { locationCity: new RegExp(`^${escapeRegex(mine.locationCity.trim())}`, "i") }
      : {};

  const vaxFilter =
    mine.intent === "breeding"
      ? { vaccinationStatus: { $in: ["up_to_date", "pending"] } }
      : {};

  const others = await MatchProfile.find({
    isActive: true,
    petType: mine.petType,
    userId: { $ne: userOid(req.user.userId) },
    petId: { $ne: pet._id },
    ageYears: { $gte: ageMin, $lte: ageMax },
    ...genderFilter,
    ...cityFilter,
    ...vaxFilter
  })
    .limit(20)
    .populate("petId", "name breed petType profileImageUrl ageYears gender vaccinationStatus")
    .lean();

  return ok(res, { suggestions: others });
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createMatchRequest(req, res) {
  const { toPetId, fromPetId, message } = assertMatchRequestBody(req.body);

  const fromPet = await Pet.findOne({ _id: fromPetId, userId: req.user.userId });
  if (!fromPet) throw new HttpError(404, "Your pet not found");

  const toPet = await Pet.findById(toPetId);
  if (!toPet) throw new HttpError(404, "Target pet not found");
  if (String(toPet.userId) === String(req.user.userId)) throw new HttpError(400, "Cannot request yourself");

  let doc;
  try {
    doc = await MatchRequest.create({
      fromUserId: userOid(req.user.userId),
      fromPetId: fromPet._id,
      toUserId: toPet.userId,
      toPetId: toPet._id,
      message: String(message).slice(0, 1000)
    });
  } catch (e) {
    if (e && e.code === 11000) throw new HttpError(409, "You already sent a request for this pet.");
    throw e;
  }

  return ok(res, { request: doc }, "Request sent", 201);
}

export async function listMatchRequests(req, res) {
  const u = userOid(req.user.userId);
  const incoming = await MatchRequest.find({ toUserId: u, status: "pending" })
    .sort({ createdAt: -1 })
    .populate("fromPetId", "name breed petType")
    .populate("toPetId", "name breed petType")
    .lean();
  const outgoing = await MatchRequest.find({ fromUserId: u })
    .sort({ createdAt: -1 })
    .populate("fromPetId", "name breed petType")
    .populate("toPetId", "name breed petType")
    .lean();

  return ok(res, { incoming, outgoing });
}
