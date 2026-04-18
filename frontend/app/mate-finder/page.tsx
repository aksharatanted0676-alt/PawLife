"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, matchesService } from "@/lib/api";
import type { PetProfile } from "@/lib/types";
import { userTier } from "@/lib/subscription";
import { UpgradeBanner } from "@/components/UpgradeBanner";

type SuggestionRow = {
  _id: string;
  petId?: { _id: string; name?: string; breed?: string; petType?: string } | string;
  locationCity?: string;
  intent?: string;
};

export default function MateFinderPage() {
  const router = useRouter();
  const { token, user, hydrated } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [intent, setIntent] = useState<"breeding" | "companion" | "playdate">("companion");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [suggestMsg, setSuggestMsg] = useState("");
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [requests, setRequests] = useState<{ incoming: unknown[]; outgoing: unknown[] } | null>(null);

  const tier = userTier(user);
  const selectedPet = useMemo(() => pets.find((p) => p._id === selectedPetId) || null, [pets, selectedPetId]);

  const loadPets = useCallback(async () => {
    if (!token) return;
    const res = await api.getPets(token);
    setPets(res.pets);
    if (res.pets[0]) setSelectedPetId((prev) => prev || res.pets[0]._id);
  }, [token]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    loadPets()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load pets"))
      .finally(() => setLoading(false));
  }, [hydrated, token, router, loadPets]);

  const saveProfile = async () => {
    if (!token || !selectedPetId) return;
    setSaving(true);
    setError("");
    try {
      await matchesService.upsertProfile(token, {
        petId: selectedPetId,
        locationCity: locationCity.trim(),
        intent,
        description: description.trim(),
        breed: selectedPet?.breed,
        ageYears: selectedPet?.ageYears,
        gender: selectedPet?.gender
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadSuggestions = async () => {
    if (!token || !selectedPetId) return;
    setLoadingSuggest(true);
    setSuggestMsg("");
    setError("");
    try {
      const res = await matchesService.getSuggestions(token, selectedPetId);
      setSuggestions((res.suggestions || []) as SuggestionRow[]);
      if (res.message) setSuggestMsg(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggestions failed");
    } finally {
      setLoadingSuggest(false);
    }
  };

  const loadRequests = async () => {
    if (!token) return;
    try {
      const res = await matchesService.listRequests(token);
      setRequests(res);
    } catch {
      setRequests(null);
    }
  };

  useEffect(() => {
    if (!token || tier !== "elite") return;
    loadRequests();
  }, [token, tier]);

  const sendInterest = async (toPetId: string) => {
    if (!token || !selectedPetId) return;
    setError("");
    try {
      await matchesService.sendRequest(token, { fromPetId: selectedPetId, toPetId, message: "Interested via Mate Finder." });
      await loadRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  if (!hydrated || !token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
        <div className="glass-panel w-full p-6 text-center text-sm text-slate-300">Loading…</div>
      </main>
    );
  }

  if (tier !== "elite") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl p-6 md:p-12">
        <UpgradeBanner
          title="Mate Finder is Elite-only"
          detail="Create a responsible match profile, browse compatible pets, and send interest requests. Upgrade to Elite to unlock this module."
          requiredTier="elite"
        />
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-cyan-300 underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6 md:p-12">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Mate Finder · Elite
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Responsible pet matching</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Profiles are rule-filtered by species, age band, location, and vaccination context for breeding intent. Always meet safely and
            follow local regulations.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">
          Dashboard
        </Link>
      </header>

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading pets…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Your pet</h2>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
            >
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} · {p.petType}
                </option>
              ))}
            </select>
            <label className="block text-xs text-slate-400">
              City (optional filter)
              <input
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                placeholder="e.g. Bengaluru"
              />
            </label>
            <label className="mt-3 block text-xs text-slate-400">
              Intent
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as typeof intent)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              >
                <option value="companion">Companion / social</option>
                <option value="playdate">Playdate</option>
                <option value="breeding">Breeding (stricter filters)</option>
              </select>
            </label>
            <label className="mt-3 block text-xs text-slate-400">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                placeholder="Temperament, goals, vet-checked, etc."
              />
            </label>
            <button
              type="button"
              disabled={saving || !selectedPetId}
              onClick={saveProfile}
              className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save match profile"}
            </button>
            <button
              type="button"
              disabled={loadingSuggest || !selectedPetId}
              onClick={loadSuggestions}
              className="ml-2 mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              {loadingSuggest ? <Loader2 className="inline h-4 w-4 animate-spin" /> : "Load suggestions"}
            </button>
          </section>

          <section className="glass-panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Suggestions</h2>
            {suggestMsg ? <p className="mb-2 text-xs text-amber-200">{suggestMsg}</p> : null}
            {suggestions.length === 0 ? (
              <p className="text-sm text-slate-400">Save a profile and load suggestions, or try another pet.</p>
            ) : (
              <ul className="space-y-3">
                {suggestions.map((s) => {
                  const pet = typeof s.petId === "object" && s.petId ? s.petId : null;
                  const toId = pet?._id;
                  const label = pet?.name || "Pet";
                  return (
                    <li key={String(s._id)} className="flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-slate-400">
                          {pet?.breed} · {pet?.petType} · {s.locationCity || "—"}
                        </p>
                      </div>
                      {toId ? (
                        <button
                          type="button"
                          onClick={() => sendInterest(toId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/50 px-2 py-1 text-xs text-cyan-200"
                        >
                          <Heart className="h-3 w-3" /> Interest
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {requests ? (
        <section className="mt-8 glass-panel p-5">
          <h2 className="mb-2 text-lg font-semibold">Requests</h2>
          <p className="text-xs text-slate-400">Incoming: {(requests.incoming || []).length} · Outgoing: {(requests.outgoing || []).length}</p>
        </section>
      ) : null}
    </main>
  );
}
