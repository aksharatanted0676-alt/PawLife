import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/db/connectMongo";
import { verifyBearerToken } from "@/lib/auth/jwtServer";
import { PetModel, type PetDoc } from "@/lib/models/Pet";
import { UserModel, type UserDoc } from "@/lib/models/User";
import { PetConnectBlockModel } from "@/lib/models/PetConnectBlock";
import {
  agesCompatible,
  agesCompatibleForBreeding,
  computeCompatibilityScore,
  formatHealthStatus,
  haversineKm,
  oppositeGender,
  type MatchMode
} from "@/lib/petMatchAlgorithm";
import type { PetType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeanPet = PetDoc & { _id: mongoose.Types.ObjectId };
type LeanUser = UserDoc & { _id: mongoose.Types.ObjectId };

type MatchFilters = {
  maxDistanceKm?: number;
  breed?: string;
  minAge?: number;
  maxAge?: number;
  mode?: MatchMode;
};

function hasValidCoords(p: PetDoc): boolean {
  const lat = p.location?.lat;
  const lng = p.location?.lng;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

function collectMissingConnectFields(p: PetDoc): string[] {
  const missing: string[] = [];
  if (!p.location?.city?.trim()) missing.push("location.city");
  if (!hasValidCoords(p)) missing.push("location.coordinates");
  if (!p.gender || p.gender === "unknown") missing.push("gender");
  if (!p.connectOptIn) missing.push("connectOptIn");
  if (!p.petConnectVerified) missing.push("petConnectVerified");
  if (p.healthStatus !== "healthy") missing.push("healthStatus (must be healthy)");
  if (p.vaccinationStatus !== "up_to_date") missing.push("vaccinationStatus (must be up-to-date)");
  return missing;
}

async function blockedUserIdStrings(me: mongoose.Types.ObjectId): Promise<Set<string>> {
  const rows = await PetConnectBlockModel.find({
    $or: [{ blockerUserId: me }, { blockedUserId: me }]
  }).lean();
  const out = new Set<string>();
  for (const r of rows) {
    if (String(r.blockerUserId) === String(me)) out.add(String(r.blockedUserId));
    if (String(r.blockedUserId) === String(me)) out.add(String(r.blockerUserId));
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const payload = verifyBearerToken(req.headers.get("authorization"));
    const meOid = new mongoose.Types.ObjectId(payload.userId);

    const body = await req.json().catch(() => ({}));
    const petId = typeof body.petId === "string" ? body.petId : "";
    const filters = (body.filters || {}) as MatchFilters;

    if (!petId || !mongoose.isValidObjectId(petId)) {
      return NextResponse.json({ error: "petId is required" }, { status: 400 });
    }

    const maxDistanceKm = Math.min(500, Math.max(1, Number(filters.maxDistanceKm) || 50));
    const minAge = Math.max(0, Number(filters.minAge) || 0);
    const maxAge = Math.min(100, Number(filters.maxAge) || 30);
    const breedFilter = typeof filters.breed === "string" ? filters.breed.trim() : "";
    const mode: MatchMode = filters.mode === "breeding" ? "breeding" : "social";

    const mongo = await connectMongo();
    if (!mongo) {
      return NextResponse.json({ error: "Database unavailable. Set MONGO_URI for Pet Connect." }, { status: 503 });
    }

    const meUser = await UserModel.findById(meOid).lean<LeanUser | null>();
    if (meUser?.petConnectAccountVerified === false) {
      return NextResponse.json({ error: "Account must be verified for Pet Connect." }, { status: 403 });
    }

    const myPet = await PetModel.findOne({ _id: petId, userId: meOid }).lean<LeanPet | null>();
    if (!myPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const myMissing = collectMissingConnectFields(myPet);
    if (myMissing.length) {
      return NextResponse.json(
        { error: "incomplete_profile", missing: myMissing, message: "Complete your Pet Connect profile to find matches." },
        { status: 400 }
      );
    }

    const hidden = await blockedUserIdStrings(meOid);
    const excludeUsers = [...hidden].map((id) => new mongoose.Types.ObjectId(id));
    excludeUsers.push(meOid);

    const candidates = await PetModel.find({
      _id: { $ne: new mongoose.Types.ObjectId(petId) },
      userId: { $nin: excludeUsers },
      petType: myPet.petType,
      connectOptIn: true,
      petConnectVerified: true,
      healthStatus: "healthy",
      vaccinationStatus: "up_to_date"
    })
      .limit(200)
      .lean<LeanPet[]>();

    const ownerIds = [...new Set(candidates.map((c) => String(c.userId)))].map((id) => new mongoose.Types.ObjectId(id));
    const ownerDocs = await UserModel.find({ _id: { $in: ownerIds } })
      .select("petConnectAccountVerified")
      .lean<Array<Pick<LeanUser, "_id" | "petConnectAccountVerified">>>();
    const verifiedSet = new Set(
      ownerDocs.filter((u) => u.petConnectAccountVerified !== false).map((u) => String(u._id))
    );

    const myLat = myPet.location!.lat!;
    const myLng = myPet.location!.lng!;

    const suggestions: string[] = [];
    const results: Array<{
      petId: string;
      petName: string;
      breed: string;
      age: number;
      distance: string;
      compatibilityScore: number;
      healthStatus: string;
      profileImageUrl: string;
      ownerUserId: string;
      verifiedBreeder: boolean;
      boostProfile: boolean;
    }> = [];

    for (const c of candidates) {
      if (!verifiedSet.has(String(c.userId))) continue;
      const candMissing = collectMissingConnectFields(c);
      if (candMissing.length) continue;

      if (c.ageYears < minAge || c.ageYears > maxAge) continue;

      if (breedFilter && c.breed.trim().toLowerCase() !== breedFilter.toLowerCase()) continue;

      if (!hasValidCoords(c)) continue;

      const dist = haversineKm(myLat, myLng, c.location!.lat!, c.location!.lng!);
      if (dist > maxDistanceKm) continue;

      if (!agesCompatible(myPet.ageYears, c.ageYears, myPet.petType as PetType)) continue;

      if (mode === "breeding") {
        if (!oppositeGender(myPet.gender, c.gender)) continue;
        if (!agesCompatibleForBreeding(myPet.ageYears, c.ageYears, myPet.petType as PetType)) continue;
      }

      const score = computeCompatibilityScore({
        myBreed: myPet.breed,
        candidateBreed: c.breed,
        filterBreed: breedFilter || undefined,
        healthScoreA: myPet.healthScore ?? 0,
        healthScoreB: c.healthScore ?? 0,
        distanceKm: dist,
        maxRadiusKm: maxDistanceKm,
        ageA: myPet.ageYears,
        ageB: c.ageYears,
        petType: myPet.petType as PetType,
        boostProfile: Boolean(c.boostProfile)
      });

      results.push({
        petId: String(c._id),
        petName: c.name,
        breed: c.breed,
        age: c.ageYears,
        distance: `${dist.toFixed(1)} km`,
        compatibilityScore: score,
        healthStatus: formatHealthStatus(c.healthStatus),
        profileImageUrl: c.profileImageUrl || "",
        ownerUserId: String(c.userId),
        verifiedBreeder: Boolean(c.verifiedBreeder),
        boostProfile: Boolean(c.boostProfile)
      });
    }

    results.sort((a, b) => {
      if (b.compatibilityScore !== a.compatibilityScore) return b.compatibilityScore - a.compatibilityScore;
      const da = parseFloat(a.distance);
      const db = parseFloat(b.distance);
      return da - db;
    });

    const top = results[0];
    if (top && top.compatibilityScore >= 80 && parseFloat(top.distance) <= maxDistanceKm * 0.5) {
      suggestions.push("Highly compatible match found nearby");
    }
    if (results.length > 0) {
      suggestions.push("Health criteria matched successfully");
    }

    return NextResponse.json({
      matches: results,
      suggestions,
      mode,
      petType: myPet.petType
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Sign in required for Pet Connect." }, { status: 401 });
    }
    if (msg === "Server misconfigured") {
      return NextResponse.json({ error: "Server misconfigured (JWT_SECRET)." }, { status: 500 });
    }
    console.error("match-pets:", err);
    return NextResponse.json({ error: "Could not load matches." }, { status: 500 });
  }
}
