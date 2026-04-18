"use client";

import Link from "next/link";
import { useState } from "react";
import { PawPrint, Sparkles } from "lucide-react";

type AdoptPet = { id: string; name: string; breed: string; ageYears: number; location: string; story: string };

const DUMMY_ADOPTION: AdoptPet[] = [
  { id: "a1", name: "Buddy", breed: "Indie", ageYears: 2, location: "Bengaluru", story: "Rescued, vaccinated, very friendly." },
  { id: "a2", name: "Nala", breed: "Indian Shorthair", ageYears: 1, location: "Mumbai", story: "Playful kitten, litter-trained." },
  { id: "a3", name: "Max", breed: "Beagle", ageYears: 3, location: "Delhi", story: "Calm, loves kids, needs daily walks." }
];

export default function AdoptionPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Adoption (demo)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Adopt a pet</h1>
          <p className="mt-2 max-w-2xl text-slate-300">A clean adoption listing experience with an interest form (mock).</p>
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
        {DUMMY_ADOPTION.map((p) => (
          <div key={p.id} className="glass-panel p-6">
            <div className="mb-2 inline-flex rounded-xl bg-white/5 p-2">
              <PawPrint className="h-4 w-4 text-cyan-200" />
            </div>
            <p className="text-lg font-semibold">{p.name}</p>
            <p className="mt-1 text-sm text-slate-300">
              {p.breed} · {p.ageYears} yrs · {p.location}
            </p>
            <p className="mt-4 text-sm text-slate-300">{p.story}</p>
            <button
              className="mt-5 w-full rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900"
              onClick={() => setSelected(p.id)}
            >
              I’m interested
            </button>
          </div>
        ))}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-panel w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-300">Adoption interest (demo)</p>
                <h2 className="text-xl font-bold">Request submitted</h2>
                <p className="mt-2 text-sm text-slate-300">
                  We’ll “contact you” soon. In a real app, this would create a lead and notify the shelter.
                </p>
              </div>
              <button className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <button className="mt-5 w-full rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" onClick={() => setSelected(null)}>
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

