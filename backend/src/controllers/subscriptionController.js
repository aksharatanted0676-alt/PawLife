import mongoose from "mongoose";
import { User } from "../models/User.js";
import { toPublicUser } from "../services/subscriptionService.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";
import { notifyInApp } from "../services/notifyInApp.js";
import { assertSubscribePlan } from "../validators/subscription.validator.js";

export async function subscribe(req, res) {
  const p = assertSubscribePlan(req.body);

  const uid = new mongoose.Types.ObjectId(req.user.userId);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const user = await User.findByIdAndUpdate(
    uid,
    { $set: { subscriptionType: p, subscriptionExpiry: expiry } },
    { new: true }
  ).select("-passwordHash");

  if (!user) throw new HttpError(404, "User not found");

  await notifyInApp({
    userId: uid,
    petId: null,
    title: `Subscription updated to ${p}`,
    message: `Your plan is active until ${expiry.toLocaleDateString()}.`,
    type: "subscription"
  });

  return ok(res, { user: toPublicUser(user) }, "Subscription updated");
}
