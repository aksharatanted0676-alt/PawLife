"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Navigation, Sparkles } from "lucide-react";

export default function GpsPage() {
  const [pos, setPos] = useState({ lat: 12.9716, lng: 77.5946 });
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!tracking) return;
    const interval = window.setInterval(() => {
      setPos((p) => ({ lat: p.lat + (Math.random() - 0.5) * 0.0008, lng: p.lng + (Math.random() - 0.5) * 0.0008 }));
    }, 1200);
    return () => window.clearInterval(interval);
  }, [tracking]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            GPS tracking UI (mock)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">GPS tracking</h1>
          <p className="mt-2 max-w-2xl text-slate-300">A clean UI mock for location tracking (no real GPS data is collected).</p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/explore">
            Explore
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold">Controls</h2>
          <p className="mt-1 text-sm text-slate-300">Demo movement updates a pin around a fixed starting location.</p>

          <button
            className={`mt-5 w-full rounded-lg px-3 py-2 text-xs font-semibold ${tracking ? "bg-rose-500 text-white" : "bg-cyan-400 text-slate-900"}`}
            onClick={() => setTracking((v) => !v)}
          >
            {tracking ? "Stop tracking (demo)" : "Start tracking (demo)"}
          </button>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs text-slate-300">Current location</p>
            <p className="mt-1 font-semibold">
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </p>
            <p className="mt-2 text-xs text-slate-400">In a real app, this would use device permissions and secure storage.</p>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Map (mock)</h2>
          <div className="mt-4 flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                <MapPin className="h-4 w-4 text-rose-200" />
                Pet location pin
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Lat: <span className="font-semibold text-slate-100">{pos.lat.toFixed(5)}</span> · Lng:{" "}
                <span className="font-semibold text-slate-100">{pos.lng.toFixed(5)}</span>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900/40 px-4 py-3 text-xs text-slate-200">
                <Navigation className="h-4 w-4 text-cyan-200" />
                Demo mode: jitter movement while tracking is on
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

