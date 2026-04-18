"use client";

import Link from "next/link";
import type { SubscriptionTier } from "@/lib/types";

export function UpgradeBanner({
  title,
  detail,
  requiredTier
}: {
  title: string;
  detail: string;
  requiredTier: Extract<SubscriptionTier, "pro" | "elite">;
}) {
  const label = requiredTier === "elite" ? "Elite" : "Pro";
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm">
      <p className="font-semibold text-amber-100">{title}</p>
      <p className="mt-1 text-slate-300">{detail}</p>
      <Link
        href="/pricing"
        className="mt-3 inline-block rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:opacity-95"
      >
        Upgrade to {label}
      </Link>
    </div>
  );
}
