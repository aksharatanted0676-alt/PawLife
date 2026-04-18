import { HttpError } from "../utils/httpError.js";

const PAID = new Set(["pro", "elite"]);

export function assertSubscribePlan(body) {
  const plan = String(body?.plan || "").toLowerCase();
  if (!PAID.has(plan)) throw new HttpError(400, 'plan must be "pro" or "elite"');
  return plan;
}
