import { PushSubscription } from "../models/PushSubscription.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export async function subscribePush(req, res) {
  const subscription = req.body;
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!isNonEmptyString(endpoint)) {
    throw new HttpError(400, "Invalid subscription");
  }

  const doc = await PushSubscription.findOneAndUpdate(
    { userId: req.user.userId, endpoint: String(endpoint) },
    {
      $set: {
        keys: { p256dh: isNonEmptyString(p256dh) ? String(p256dh) : "", auth: isNonEmptyString(auth) ? String(auth) : "" },
        raw: subscription
      }
    },
    { upsert: true, new: true }
  );

  return ok(res, { subscription: doc }, "Push subscription saved", 201);
}

export async function unsubscribePush(req, res) {
  const { endpoint } = req.body || {};
  if (!isNonEmptyString(endpoint)) throw new HttpError(400, "endpoint is required");
  await PushSubscription.findOneAndDelete({ userId: req.user.userId, endpoint: String(endpoint) });
  return ok(res, { success: true }, "Unsubscribed");
}
