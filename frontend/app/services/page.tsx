"use client";

import Link from "next/link";
import { MapPin, Scissors, ShoppingBag, Sparkles } from "lucide-react";

const services = [
  { id: "s1", name: "Fluffy Groomers", type: "Grooming", distanceKm: 1.2, price: "₹₹", note: "Known for gentle handling." },
  { id: "s2", name: "PawMart Pet Shop", type: "Shop", distanceKm: 2.8, price: "₹", note: "Food, toys, and essentials." },
  { id: "s3", name: "Happy Tails Trainer", type: "Training", distanceKm: 4.1, price: "₹₹₹", note: "Positive reinforcement only." }
];

export default function ServicesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Nearby services (demo)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Nearby pet services</h1>
          <p className="mt-2 max-w-2xl text-slate-300">A polished marketplace-like view using dummy listings.</p>
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

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="glass-panel p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-slate-300">{s.type}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2">
                {s.type === "Grooming" ? <Scissors className="h-4 w-4 text-cyan-200" /> : <ShoppingBag className="h-4 w-4 text-cyan-200" />}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">{s.note}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1">
                <MapPin className="h-3 w-3" /> {s.distanceKm} km
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">{s.price}</span>
              <button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900" onClick={() => alert(`Demo: booking ${s.name}`)}>
                Book
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

