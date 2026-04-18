import type { SubscriptionTier, User } from "./types";

export type { SubscriptionTier };

export type SubscriptionPlan = {
  id: SubscriptionTier;
  name: string;
  priceLabel: string;
  monthlyPrice: number;
  highlight?: boolean;
  features: {
    maxPets: number;
    dietCustomization: "basic" | "full" | "advanced";
    priorityNotifications: boolean;
    matchmaking: boolean;
    recordsStorage: boolean;
  };
};

export const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "INR 0",
    monthlyPrice: 0,
    features: {
      maxPets: 2,
      dietCustomization: "basic",
      priorityNotifications: false,
      matchmaking: false,
      recordsStorage: true
    }
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "INR 299 / mo",
    monthlyPrice: 299,
    highlight: true,
    features: {
      maxPets: 25,
      dietCustomization: "full",
      priorityNotifications: true,
      matchmaking: false,
      recordsStorage: true
    }
  },
  {
    id: "elite",
    name: "Elite",
    priceLabel: "INR 699 / mo",
    monthlyPrice: 699,
    features: {
      maxPets: 50,
      dietCustomization: "advanced",
      priorityNotifications: true,
      matchmaking: true,
      recordsStorage: true
    }
  }
];

const LEGACY_STORAGE_KEY = "pawlife_subscription_plan";

/** Effective tier from server user (authoritative). */
export function userTier(user: User | null | undefined): SubscriptionTier {
  const t = user?.subscriptionType;
  if (t === "pro" || t === "elite") return t;
  return "free";
}

export function getPlan(tier: SubscriptionTier): SubscriptionPlan {
  return PLANS.find((p) => p.id === tier) || PLANS[0];
}

export function maxMealsAllowedForTier(tier: SubscriptionTier): number {
  if (tier === "elite") return 50;
  if (tier === "pro") return 30;
  return 7;
}

export function migrateLegacyPlanId(): SubscriptionTier | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved === "pro") return "elite";
  if (saved === "premium") return "pro";
  if (saved === "basic") return "free";
  return null;
}

export function clearLegacyPlanStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}
