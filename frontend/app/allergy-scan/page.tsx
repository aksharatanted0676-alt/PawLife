"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";

type ScanResult = "Possible Skin Allergy" | "Healthy" | "Infection Risk";

function suggestionsFor(result: ScanResult) {
  if (result === "Healthy") {
    return ["Keep the area clean and dry", "Monitor for redness or itching for 24–48 hours", "Maintain a balanced diet and hydration"];
  }
  if (result === "Possible Skin Allergy") {
    return ["Clean the area with mild pet-safe cleanser", "Avoid new shampoos/foods until symptoms settle", "If itching persists, consult a vet for antihistamine guidance"];
  }
  return ["Do not apply human antibiotic creams without vet guidance", "Prevent licking/scratching (use cone if needed)", "Visit a vet soon—signs of infection can worsen quickly"];
}

export default function AllergyScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(() => (result ? suggestionsFor(result) : []), [result]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Image-based skin check (simulation)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Skin Allergy Detection</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Upload a pet photo, preview it, and run a simulated analysis. This demo uses dummy logic (no real medical diagnosis).
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
          <h2 className="text-lg font-semibold">Upload image</h2>
          <p className="mt-1 text-sm text-slate-300">PNG/JPG/WebP recommended. Clear lighting helps.</p>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="block text-xs font-semibold text-slate-200">Pet image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-2 w-full text-xs"
              onChange={(e) => {
                const next = e.target.files?.[0] || null;
                setFile(next);
                setResult(null);
                if (!next) {
                  setPreviewUrl("");
                  return;
                }
                const url = URL.createObjectURL(next);
                setPreviewUrl(url);
              }}
            />
            <button
              disabled={!file || loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-70"
              onClick={async () => {
                if (!file) return;
                setLoading(true);
                setResult(null);
                await new Promise((r) => setTimeout(r, 900));
                const roll = Math.random();
                const next: ScanResult = roll < 0.55 ? "Possible Skin Allergy" : roll < 0.82 ? "Healthy" : "Infection Risk";
                setResult(next);
                setLoading(false);
              }}
            >
              <ImageIcon className="h-4 w-4" />
              {loading ? "Analyzing…" : "Analyze image"}
            </button>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold">Preview & result</h2>
          <div className="mt-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Pet upload preview" className="h-72 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-72 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300">
                Upload an image to see preview.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">Output</p>
            <p className="mt-1 text-xl font-bold">{result ? result : loading ? "Analyzing…" : "—"}</p>
            {result ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
                {suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-xs text-slate-400">
              This is a simulated AI demo. For any severe symptoms (bleeding, swelling, lethargy), consult a vet immediately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

