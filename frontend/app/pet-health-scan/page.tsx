"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, ImageIcon, RefreshCw, Sparkles, Upload } from "lucide-react";
import type { PetType } from "@/lib/types";
import type { HealthRiskLevel, PetHealthAnalysis } from "@/lib/petHealthSimulation";

const PET_OPTIONS: { value: PetType; label: string }[] = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "fish", label: "Fish" }
];

const ACCEPT = "image/jpeg,image/png";

function riskStyles(risk: HealthRiskLevel): { badge: string; label: string } {
  if (risk === "LOW") {
    return {
      badge: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
      label: "Low"
    };
  }
  if (risk === "MEDIUM") {
    return {
      badge: "border-amber-400/50 bg-amber-500/15 text-amber-200",
      label: "Medium"
    };
  }
  return {
    badge: "border-rose-400/50 bg-rose-500/15 text-rose-200",
    label: "High"
  };
}

function validateImageFile(file: File): string | null {
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return "Please use a JPG or PNG image.";
  }
  if (file.size > 8 * 1024 * 1024) {
    return "Image must be 8MB or smaller.";
  }
  return null;
}

export default function PetHealthScanPage() {
  const [petType, setPetType] = useState<PetType>("dog");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PetHealthAnalysis | null>(null);
  const [error, setError] = useState("");
  const [progressPulse, setProgressPulse] = useState(false);

  const setFileFromBrowser = useCallback((next: File | null) => {
    setError("");
    setResult(null);
    setFile(next);
    if (!next) {
      setPreviewUrl("");
      return;
    }
    const msg = validateImageFile(next);
    if (msg) {
      setError(msg);
      setFile(null);
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!loading) {
      setProgressPulse(false);
      return;
    }
    setProgressPulse(true);
    const t = window.setInterval(() => setProgressPulse((p) => !p), 700);
    return () => window.clearInterval(t);
  }, [loading]);

  const riskVisual = useMemo(() => (result ? riskStyles(result.risk) : null), [result]);

  const analyze = async () => {
    if (!file) {
      setError("Upload an image first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("petType", petType);
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: form
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : "Analysis failed.";
        throw new Error(msg);
      }
      const { issue, confidence, risk, description, action, steps } = data;
      if (
        typeof issue !== "string" ||
        typeof confidence !== "number" ||
        typeof risk !== "string" ||
        typeof description !== "string" ||
        typeof action !== "string" ||
        !Array.isArray(steps)
      ) {
        throw new Error("Unexpected response from server.");
      }
      setResult({
        issue,
        confidence,
        risk: risk as HealthRiskLevel,
        description,
        action,
        steps: steps.map(String)
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setResult(null);
    setError("");
    setFile(null);
    setPreviewUrl("");
    setLoading(false);
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Image-based pet health check (simulated AI)
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Pet Health Detection</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Upload a clear photo, choose a pet type, and receive structured, simulated findings. Not a substitute for a veterinarian.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/allergy-scan">
            Skin scan
          </Link>
        </div>
      </header>

      {error ? (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold">Upload &amp; pet type</h2>
          <p className="mt-1 text-sm text-slate-300">JPG or PNG only. Drag and drop or browse.</p>

          <label className="mt-4 block text-xs font-semibold text-slate-200">Pet type</label>
          <select
            value={petType}
            onChange={(e) => {
              setPetType(e.target.value as PetType);
              setResult(null);
            }}
            className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-cyan-400/40 focus:ring-2"
          >
            {PET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div
            className={`mt-4 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
              dragActive ? "border-cyan-400/70 bg-cyan-500/10" : "border-white/15 bg-white/[0.03]"
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) setFileFromBrowser(dropped);
            }}
            onClick={() => document.getElementById("pet-health-file")?.click()}
            role="presentation"
          >
            <Upload className="h-10 w-10 text-cyan-300/80" />
            <p className="mt-3 text-center text-sm font-medium">Drop image here or click to browse</p>
            <p className="mt-1 text-center text-xs text-slate-400">PNG, JPEG · max 8MB</p>
            <input
              id="pet-health-file"
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const next = e.target.files?.[0] || null;
                setFileFromBrowser(next);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!file || loading}
              onClick={analyze}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Activity className="h-4 w-4 animate-pulse" />
                  Analyzing…
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" />
                  Analyze image
                </>
              )}
            </button>
            <button
              type="button"
              onClick={retry}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            This is an AI-based estimation, not a medical diagnosis. Always consult a licensed veterinarian for diagnosis and treatment.
          </p>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold">Preview &amp; results</h2>
          <div className="mt-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Pet upload preview" className="h-72 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-72 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300">
                No preview yet.
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                Analyzing image patterns…
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700 ${
                    progressPulse ? "w-[72%]" : "w-[38%]"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400">Simulating multi-signal scoring for your selected species…</p>
            </div>
          ) : null}

          {result && !loading ? (
            <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Detected issue</p>
                  <p className="mt-1 text-xl font-bold text-slate-50">{result.issue}</p>
                </div>
                {riskVisual ? (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskVisual.badge}`}>
                    Risk: {riskVisual.label}
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Confidence</span>
                  <span className="font-mono font-semibold text-cyan-200">{result.confidence}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Explanation</p>
                <p className="mt-1 text-sm text-slate-200">{result.description}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Recommended action</p>
                <p className="mt-1 text-sm text-slate-200">{result.action}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Steps</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                  {result.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {!result && !loading ? (
            <p className="mt-4 text-sm text-slate-400">Run analysis to see confidence, risk level, and care steps.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
