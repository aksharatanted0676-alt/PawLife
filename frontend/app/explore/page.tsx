"use client";

import Link from "next/link";
import { Compass, MapPin, MessageSquare, PawPrint, Sparkles } from "lucide-react";

const modules = [
  { href: "/community", title: "Community Feed", desc: "Post updates, share photos, and react (demo)." },
  { href: "/services", title: "Nearby Pet Services", desc: "Groomers, shops, trainers (dummy data)." },
  { href: "/adoption", title: "Adoption", desc: "Browse adoptable pets and submit interest (demo)." },
  { href: "/gps", title: "GPS Tracking", desc: "Mock tracking UI with safe, non-invasive UX." }
];

export default function ExplorePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Bonus modules (demo)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Explore</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Optional sections that make the app feel like a real product suite.</p>
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

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.href} href={m.href as never} className="glass-panel p-6 hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{m.title}</p>
                <p className="mt-1 text-sm text-slate-300">{m.desc}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2">
                {m.href === "/community" ? (
                  <MessageSquare className="h-4 w-4 text-cyan-200" />
                ) : m.href === "/services" ? (
                  <MapPin className="h-4 w-4 text-cyan-200" />
                ) : m.href === "/adoption" ? (
                  <PawPrint className="h-4 w-4 text-cyan-200" />
                ) : (
                  <Compass className="h-4 w-4 text-cyan-200" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

