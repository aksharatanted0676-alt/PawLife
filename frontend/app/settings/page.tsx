"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getBrowserPushSubscription, registerBrowserPush, unregisterBrowserPush } from "@/lib/push";

export default function SettingsPage() {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    getBrowserPushSubscription()
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => setEnabled(false));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}

      <section className="glass-panel p-5">
        <h2 className="text-sm font-semibold">Push Notifications (Phase 2)</h2>
        <p className="mt-1 text-sm text-slate-300">
          This registers your browser subscription securely with the backend. Delivery will be wired into the reminder scheduler next.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-300">Status: {enabled === null ? "Checking…" : enabled ? "Enabled" : "Disabled"}</span>
          <button
            disabled={loading || !token}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-70"
            onClick={async () => {
              if (!token) return;
              setError("");
              setLoading(true);
              try {
                await registerBrowserPush(token);
                setEnabled(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to enable push");
              } finally {
                setLoading(false);
              }
            }}
          >
            Enable push
          </button>
          <button
            disabled={loading || !token}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs disabled:opacity-70"
            onClick={async () => {
              if (!token) return;
              setError("");
              setLoading(true);
              try {
                await unregisterBrowserPush(token);
                setEnabled(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to disable push");
              } finally {
                setLoading(false);
              }
            }}
          >
            Disable push
          </button>
        </div>
      </section>
    </main>
  );
}

