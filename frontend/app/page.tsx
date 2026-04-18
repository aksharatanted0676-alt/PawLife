"use client";

import Link from "next/link";
import { PawPrint, Shield, Sparkles, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { token } = useAuth();

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 md:p-12">
      <header className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 font-semibold">
          <PawPrint className="h-5 w-5 text-cyan-300" />
          PawLife
        </div>
        <div className="flex items-center gap-2">
          {token ? (
            <Link className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900" href="/dashboard">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/login">
                Login
              </Link>
              <Link className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900" href="/signup">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Pet health, made simple
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">A modern Pet Health Web App for real life.</h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Track pets, store medical records, set reminders, and get instant guidance through a friendly assistant—built to feel like a real startup product.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link className="rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900" href={token ? "/dashboard" : "/signup"}>
              {token ? "Open dashboard" : "Create free account"}
            </Link>
            <Link className="rounded-lg border border-white/20 px-4 py-3 text-sm hover:bg-white/10" href="/login">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-sm font-semibold">How it works</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm font-semibold">1) Create pet profiles</p>
              <p className="mt-1 text-sm text-slate-300">Name, breed, age, weight, vaccination and history—everything in one place.</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm font-semibold">2) Get smart guidance</p>
              <p className="mt-1 text-sm text-slate-300">Ask about symptoms, diet, and care with pet context included.</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm font-semibold">3) Never miss reminders</p>
              <p className="mt-1 text-sm text-slate-300">Vaccines, meds, grooming—get in-app notifications and upcoming reminders.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5">
          <div className="mb-2 inline-flex rounded-lg bg-white/5 p-2">
            <Shield className="h-4 w-4 text-cyan-200" />
          </div>
          <p className="text-sm font-semibold">Secure by default</p>
          <p className="mt-1 text-sm text-slate-300">Keys stay in the backend. JWT auth, input validation, and ownership checks.</p>
        </div>
        <div className="glass-panel p-5">
          <div className="mb-2 inline-flex rounded-lg bg-white/5 p-2">
            <Stethoscope className="h-4 w-4 text-cyan-200" />
          </div>
          <p className="text-sm font-semibold">Health records</p>
          <p className="mt-1 text-sm text-slate-300">Upload prescriptions/reports and keep a timeline per pet.</p>
        </div>
        <div className="glass-panel p-5">
          <div className="mb-2 inline-flex rounded-lg bg-white/5 p-2">
            <Sparkles className="h-4 w-4 text-cyan-200" />
          </div>
          <p className="text-sm font-semibold">Beautiful UX</p>
          <p className="mt-1 text-sm text-slate-300">Clean cards, soft gradients, responsive layout, and fast flows.</p>
        </div>
      </section>

      <section className="mt-10 glass-panel p-6">
        <h2 className="text-lg font-semibold">Explore more</h2>
        <p className="mt-1 text-sm text-slate-300">Community, services, adoption, and a GPS UI mock—built for that “real product” feel.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/explore">
            Open Explore
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/community">
            Community
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/services">
            Services
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/adoption">
            Adoption
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/gps">
            GPS
          </Link>
        </div>
      </section>

      <footer className="mt-14 border-t border-white/10 pt-6 text-xs text-slate-400">
        Built for demo + production-minded architecture. Next: subscriptions, allergy scan, matchmaking, SOS, and community.
      </footer>
    </main>
  );
}

