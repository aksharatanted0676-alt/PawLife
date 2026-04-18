"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { MedicalEntry, PetProfile } from "@/lib/types";

type TimelineItem =
  | { kind: "history"; date: string; title: string; subtitle: string }
  | { kind: "vaccine"; date: string; title: string; subtitle: string }
  | { kind: "file"; date: string; title: string; subtitle: string; url: string };

export default function RecordsPage() {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [entry, setEntry] = useState<MedicalEntry>({
    date: new Date().toISOString().slice(0, 10),
    note: "",
    type: "visit"
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getPets(token)
      .then((res) => {
        setPets(res.pets);
        setSelectedPetId((prev) => prev || res.pets[0]?._id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load pets"))
      .finally(() => setLoading(false));
  }, [token]);

  const selectedPet = useMemo(() => pets.find((p) => p._id === selectedPetId) || null, [pets, selectedPetId]);

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!selectedPet) return [];
    const items: TimelineItem[] = [];
    for (const h of selectedPet.medicalHistory || []) {
      items.push({
        kind: "history",
        date: h.date,
        title: h.note,
        subtitle: `Medical · ${h.type}`
      });
    }
    for (const v of selectedPet.vaccinationRecords || []) {
      items.push({
        kind: "vaccine",
        date: v.dueDate,
        title: v.vaccine,
        subtitle: `Vaccination · ${v.status}`
      });
    }
    for (const url of selectedPet.reports || []) {
      items.push({
        kind: "file",
        date: selectedPet.updatedAt ? String(selectedPet.updatedAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
        title: "Uploaded document",
        subtitle: url.toLowerCase().includes(".pdf") ? "PDF report" : "Image report",
        url
      });
    }

    return items
      .filter((i) => Boolean(i.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPet]);

  if (!token || loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
        <div className="glass-panel w-full p-6 text-center text-sm text-slate-300">Loading…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Medical records
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Records & timeline</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Upload prescriptions/reports and maintain a timeline of health events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold">Select pet</h2>
          <select
            className="mt-3 w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            {pets.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} · {p.breed}
              </option>
            ))}
          </select>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Upload document</h3>
            <p className="mt-1 text-xs text-slate-300">PDF/images. Stored securely on backend.</p>
            <input
              className="mt-3 w-full text-xs"
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              disabled={uploading || !selectedPet}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !token || !selectedPet) return;
                setUploading(true);
                setError("");
                try {
                  const res = await api.uploadReport(token, selectedPet._id, file);
                  setPets((prev) => prev.map((p) => (p._id === selectedPet._id ? res.pet : p)));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <FileUp className="h-4 w-4" />
              {uploading ? "Uploading…" : "Max 5MB"}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Add timeline entry</h3>
            <form
              className="mt-3 grid gap-2"
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (!token || !selectedPet) return;
                if (!entry.note.trim()) return;
                setError("");
                try {
                  const nextHistory = [...(selectedPet.medicalHistory || []), { ...entry, note: entry.note.trim() }];
                  const res = await api.updatePet(token, selectedPet._id, { medicalHistory: nextHistory });
                  setPets((prev) => prev.map((p) => (p._id === selectedPet._id ? res.pet : p)));
                  setEntry((x) => ({ ...x, note: "" }));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to add entry");
                }
              }}
            >
              <input
                type="date"
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
                value={entry.date}
                onChange={(e) => setEntry((x) => ({ ...x, date: e.target.value }))}
              />
              <select
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
                value={entry.type}
                onChange={(e) => setEntry((x) => ({ ...x, type: e.target.value as MedicalEntry["type"] }))}
              >
                <option value="visit">Vet visit</option>
                <option value="illness">Illness</option>
                <option value="vaccine">Vaccine</option>
              </select>
              <textarea
                className="min-h-[90px] rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
                placeholder="Notes (symptoms, diagnosis, meds, etc.)"
                value={entry.note}
                onChange={(e) => setEntry((x) => ({ ...x, note: e.target.value }))}
              />
              <button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900">Add entry</button>
            </form>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="mt-1 text-sm text-slate-300">Combined view of history, vaccinations, and uploaded docs.</p>

          <div className="mt-5 space-y-3">
            {timeline.length === 0 ? <p className="text-sm text-slate-300">No records yet.</p> : null}
            {timeline.map((t, idx) => (
              <div key={`${t.kind}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{t.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200">{t.date}</span>
                </div>
                {"url" in t ? (
                  <a className="mt-3 inline-block text-xs text-cyan-200 underline-offset-2 hover:underline" href={t.url} target="_blank" rel="noreferrer">
                    Open document
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

