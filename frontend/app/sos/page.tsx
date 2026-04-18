"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ambulance, MapPin, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";

type Vet = { id: string; name: string; address: string; phone: string; distanceKm: number; openNow: boolean };

const DUMMY_VETS: Vet[] = [
  { id: "v1", name: "City Pet Clinic", address: "12 Lake Road, Bengaluru", phone: "+91 90123 45678", distanceKm: 1.8, openNow: true },
  { id: "v2", name: "Emergency Vet Hospital", address: "88 MG Street, Bengaluru", phone: "+91 98765 43210", distanceKm: 3.4, openNow: true },
  { id: "v3", name: "Happy Paws Vet", address: "5 Park Avenue, Bengaluru", phone: "+91 88990 11223", distanceKm: 6.2, openNow: false }
];

export default function SosPage() {
  const [requesting, setRequesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "requested" | "dispatched" | "arriving">("idle");
  const vets = useMemo(() => [...DUMMY_VETS].sort((a, b) => a.distanceKm - b.distanceKm), []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            SOS / Emergency (simulation)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Emergency support</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            One-tap SOS, nearby vets, and a simulated ambulance request flow. For real emergencies, call your local services immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/pricing">
            Plans
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold">Emergency button</h2>
          <p className="mt-1 text-sm text-slate-300">Simulates triage + dispatch updates. No real calls are made.</p>

          <button
            disabled={requesting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-4 text-sm font-black text-white disabled:opacity-70"
            onClick={async () => {
              setRequesting(true);
              setStatus("requested");
              await new Promise((r) => setTimeout(r, 800));
              setStatus("dispatched");
              await new Promise((r) => setTimeout(r, 1000));
              setStatus("arriving");
              setRequesting(false);
            }}
          >
            <Ambulance className="h-5 w-5" />
            Request Pet Ambulance (Demo)
          </button>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs text-slate-300">Status</p>
            <p className="mt-1 font-semibold">
              {status === "idle"
                ? "Idle"
                : status === "requested"
                  ? "Request received"
                  : status === "dispatched"
                    ? "Ambulance dispatched"
                    : "Ambulance arriving soon"}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Tip: If your pet is unconscious, bleeding heavily, or struggling to breathe, seek immediate veterinary care.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Nearby vets</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              Dummy list
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {vets.map((v) => (
              <div key={v.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="mt-1 text-xs text-slate-300">{v.address}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] ${v.openNow ? "bg-emerald-500/15 text-emerald-200" : "bg-white/5 text-slate-300"}`}>
                    {v.openNow ? "Open now" : "Closed"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200">
                    <MapPin className="h-3 w-3" /> {v.distanceKm} km
                  </span>
                  <a className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900" href={`tel:${v.phone}`}>
                    <PhoneCall className="h-4 w-4" />
                    Call
                  </a>
                  <button className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" onClick={() => alert(`Demo: directions to ${v.name}`)}>
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

