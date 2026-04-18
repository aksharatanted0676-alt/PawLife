"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import type { SubscriptionPlan, SubscriptionTier } from "@/lib/subscription";
import { clearLegacyPlanStorage, getPlan, PLANS, userTier } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

function FeatureRow({ label, value }: { label: string; value: string | boolean }) {
  const display = typeof value === "boolean" ? (value ? "Included" : "—") : String(value);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
      <span className="text-slate-200">{label}</span>
      <span className={typeof value === "boolean" ? (value ? "text-emerald-300" : "text-slate-400") : "text-slate-300"}>{display}</span>
    </div>
  );
}

function PaymentModal({
  plan,
  onClose,
  onSuccess
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-panel w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-cyan-200">Simulated payment</p>
            <h2 className="text-xl font-bold">
              Upgrade to {plan.name} <span className="text-sm text-slate-300">({plan.priceLabel})</span>
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Demo checkout only. For production, connect Stripe or Razorpay and activate the plan in POST /subscribe after payment
              success.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          <input className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm" placeholder="Card number (dummy)" />
          <div className="grid grid-cols-2 gap-2">
            <input className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm" placeholder="MM/YY" />
            <input className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm" placeholder="CVC" />
          </div>
          <input className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm" placeholder="Name on card" />
        </div>

        {err ? <p className="mt-2 text-sm text-rose-300">{err}</p> : null}

        <button
          type="button"
          disabled={processing}
          onClick={async () => {
            setErr("");
            setProcessing(true);
            try {
              await new Promise((r) => setTimeout(r, 600));
              await onSuccess();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            } finally {
              setProcessing(false);
            }
          }}
          className="mt-4 w-full rounded-lg bg-cyan-400 p-2 text-sm font-semibold text-slate-900 disabled:opacity-70"
        >
          {processing ? "Processing…" : `Confirm upgrade to ${plan.name}`}
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { token, user, refreshUser } = useAuth();
  const [checkoutTier, setCheckoutTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    clearLegacyPlanStorage();
  }, []);

  const activeTier = userTier(user);
  const activePlan = useMemo(() => getPlan(activeTier), [activeTier]);
  const checkoutPlan = checkoutTier ? getPlan(checkoutTier) : null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Subscription plans
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Choose the plan that fits your pet&apos;s needs.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Free includes up to two pets and read-only auto-generated diets. Pro unlocks more pets and diet customization. Elite adds mate
            finder, advanced diet targets, and premium notifications. Paid tiers use a 30-day demo expiry on the server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/">
            Home
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      {!token ? (
        <p className="mt-6 text-sm text-amber-200">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to upgrade your plan on the server.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isActive = plan.id === activeTier;
          return (
            <div key={plan.id} className={`glass-panel p-6 ${plan.highlight ? "ring-1 ring-cyan-300/40" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-300">
                    {plan.id === "elite" ? "Maximum value" : plan.id === "pro" ? "Most popular" : "Get started"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{plan.name}</h2>
                </div>
                {plan.id !== "free" ? <Crown className="h-4 w-4 text-cyan-200" /> : null}
              </div>
              <p className="mt-4 text-3xl font-black">{plan.priceLabel}</p>

              <div className="mt-4 grid gap-2">
                <FeatureRow label="Pets allowed" value={`Up to ${plan.features.maxPets}`} />
                <FeatureRow label="Diet customization" value={plan.features.dietCustomization} />
                <FeatureRow label="Priority notifications" value={plan.features.priorityNotifications} />
                <FeatureRow label="Mate finder (Pet Connect)" value={plan.features.matchmaking} />
                <FeatureRow label="Medical record storage" value={plan.features.recordsStorage} />
              </div>

              <div className="mt-5 flex gap-2">
                {isActive ? (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200">
                    <Check className="h-4 w-4" /> Active
                  </span>
                ) : plan.id === "free" ? (
                  <span className="text-xs text-slate-400">Default for new accounts</span>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900"
                    onClick={() => setCheckoutTier(plan.id)}
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-10 glass-panel p-6">
        <h2 className="text-lg font-semibold">Active subscription</h2>
        <p className="mt-1 text-sm text-slate-300">
          You&apos;re currently on <span className="font-semibold text-cyan-200">{activePlan.name}</span>.
          {user?.subscriptionExpiry ? (
            <>
              {" "}
              Paid access valid through {new Date(user.subscriptionExpiry).toLocaleDateString()} (demo rollover).
            </>
          ) : null}
        </p>
      </section>

      {checkoutPlan && token ? (
        <PaymentModal
          plan={checkoutPlan}
          onClose={() => setCheckoutTier(null)}
          onSuccess={async () => {
            const tier = checkoutPlan.id;
            if (tier === "free") return;
            await api.subscribe(token, tier);
            await refreshUser();
            setCheckoutTier(null);
          }}
        />
      ) : null}
    </main>
  );
}
