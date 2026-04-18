"use client";

import { useAuth } from "@/lib/auth";
import { getPlan, userTier } from "@/lib/subscription";

export function SubscriptionBadge() {
  const { user } = useAuth();
  const tier = userTier(user);
  const plan = getPlan(tier);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
      Plan: <span className="font-semibold text-cyan-200">{plan.name}</span>
    </span>
  );
}
