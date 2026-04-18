import mongoose from "mongoose";
import { User } from "../models/User.js";

const TIER_LEVEL = { free: 0, pro: 1, elite: 2 };

/**
 * Effective tier: expired paid plans fall back to free.
 */
export function effectiveSubscriptionType(userDoc) {
  if (!userDoc) return "free";
  const raw = userDoc.subscriptionType || "free";
  if (raw === "free") return "free";
  const exp = userDoc.subscriptionExpiry ? new Date(userDoc.subscriptionExpiry) : null;
  if (!exp || Number.isNaN(exp.getTime()) || exp.getTime() < Date.now()) {
    return "free";
  }
  return raw === "elite" || raw === "pro" ? raw : "free";
}

export function tierLevel(tier) {
  return TIER_LEVEL[tier] ?? 0;
}

export function tierMeetsRequirement(effectiveTier, requiredTier) {
  return tierLevel(effectiveTier) >= tierLevel(requiredTier);
}

/**
 * @param {string} userId
 */
export async function getEffectiveSubscription(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const user = await User.findById(uid).select("subscriptionType subscriptionExpiry name email").lean();
  if (!user) return { user: null, effective: "free" };
  return { user, effective: effectiveSubscriptionType(user) };
}

/**
 * Shape returned to the client on login /me (never include passwordHash).
 */
export function toPublicUser(userDoc) {
  if (!userDoc) return null;
  const effective = effectiveSubscriptionType(userDoc);
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    subscriptionType: effective,
    subscriptionExpiry: userDoc.subscriptionExpiry ? new Date(userDoc.subscriptionExpiry).toISOString() : null
  };
}

/** Max diet meal rows (weekly grid or simple rows) by tier. */
export function maxDietMealsForTier(tier) {
  if (tier === "elite") return 50;
  if (tier === "pro") return 30;
  return 7;
}

/** Max pets per effective subscription tier (enforced on create). */
export function maxPetsForTier(tier) {
  if (tier === "elite") return 50;
  if (tier === "pro") return 25;
  return 2;
}
