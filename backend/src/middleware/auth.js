import { verifyJwt } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { effectiveSubscriptionType } from "../services/subscriptionService.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * Verifies JWT and attaches the current user including effective subscription tier.
 * One DB read per request keeps subscription checks accurate without bloating the token.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) throw new HttpError(401, "Unauthorized");

  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    throw new HttpError(401, "Invalid token");
  }

  const userId = String(payload.userId);
  const user = await User.findById(userId).select("email name subscriptionType subscriptionExpiry").lean();
  if (!user) throw new HttpError(401, "User not found");

  const subscriptionType = effectiveSubscriptionType(user);
  req.user = {
    userId,
    email: user.email,
    name: user.name,
    subscriptionType,
    subscriptionExpiry: user.subscriptionExpiry || null
  };
  next();
});
