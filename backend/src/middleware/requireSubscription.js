import { getEffectiveSubscription, tierMeetsRequirement } from "../services/subscriptionService.js";
import { HttpError } from "../utils/httpError.js";

/**
 * @param {"pro"|"elite"} minTier
 */
export function requireSubscription(minTier) {
  return async (req, res, next) => {
    try {
      const { effective } = await getEffectiveSubscription(req.user.userId);
      req.subscription = { effective };
      if (!tierMeetsRequirement(effective, minTier)) {
        throw new HttpError(
          403,
          `This action requires ${minTier} plan or higher. Upgrade in Subscription.`,
          "SUBSCRIPTION_REQUIRED"
        );
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
