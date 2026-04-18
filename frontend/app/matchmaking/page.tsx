"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { breedOptionsByPet } from "@/lib/petOptions";
import type {
  PetConnectMessageRow,
  PetConnectRequestRow,
  PetGender,
  PetHealthStatus,
  PetMatchResult,
  PetProfile,
  PetType,
  PetVaccinationConnectStatus,
  PopulatedPetBrief
} from "@/lib/types";

function briefPet(p: PopulatedPetBrief | string): PopulatedPetBrief {
  if (typeof p === "object" && p !== null && "_id" in p) return p as PopulatedPetBrief;
  return { _id: String(p), name: "Pet", breed: "", petType: "dog" };
}

export default function MatchmakingPage() {
  const router = useRouter();
  const { token, user, hydrated } = useAuth();

  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [loadingPets, setLoadingPets] = useState(true);
  const [pageError, setPageError] = useState("");

  const [gender, setGender] = useState<PetGender>("unknown");
  const [healthStatus, setHealthStatus] = useState<PetHealthStatus>("healthy");
  const [vaccinationStatus, setVaccinationStatus] = useState<PetVaccinationConnectStatus>("pending");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [healthScore, setHealthScore] = useState(80);
  const [connectOptIn, setConnectOptIn] = useState(false);
  const [petConnectVerified, setPetConnectVerified] = useState(false);
  const [verifiedBreeder, setVerifiedBreeder] = useState(false);
  const [boostProfile, setBoostProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [filters, setFilters] = useState({
    maxDistanceKm: 50,
    breed: "",
    minAge: 0,
    maxAge: 15,
    mode: "social" as "social" | "breeding"
  });

  const [matches, setMatches] = useState<PetMatchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [profileMissing, setProfileMissing] = useState<string[]>([]);

  const [incoming, setIncoming] = useState<PetConnectRequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<PetConnectRequestRow[]>([]);
  const [accepted, setAccepted] = useState<PetConnectRequestRow[]>([]);
  const [connectBusyId, setConnectBusyId] = useState("");

  const [chatConnectionId, setChatConnectionId] = useState("");
  const [chatMessages, setChatMessages] = useState<PetConnectMessageRow[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [reportOpenFor, setReportOpenFor] = useState<{ userId: string; petId: string } | null>(null);
  const [reportReason, setReportReason] = useState("");

  const selectedPet = useMemo(() => pets.find((p) => p._id === selectedPetId) || null, [pets, selectedPetId]);
  const breedOptions = selectedPet ? breedOptionsByPet[selectedPet.petType] : breedOptionsByPet.dog;

  const loadRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getConnectRequests(token);
      setIncoming(res.incoming);
      setOutgoing(res.outgoing);
      setAccepted(res.accepted);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoadingPets(true);
    api
      .getPets(token)
      .then((res) => {
        setPets(res.pets);
        if (res.pets[0]) setSelectedPetId((prev) => prev || res.pets[0]._id);
      })
      .catch((e) => setPageError(e instanceof Error ? e.message : "Failed to load pets"))
      .finally(() => setLoadingPets(false));
    loadRequests();
  }, [hydrated, token, router, loadRequests]);

  useEffect(() => {
    if (!selectedPet) return;
    setGender((selectedPet.gender as PetGender) || "unknown");
    setHealthStatus((selectedPet.healthStatus as PetHealthStatus) || "healthy");
    setVaccinationStatus((selectedPet.vaccinationStatus as PetVaccinationConnectStatus) || "pending");
    setCity(selectedPet.location?.city || "");
    setLat(selectedPet.location?.lat != null ? String(selectedPet.location.lat) : "");
    setLng(selectedPet.location?.lng != null ? String(selectedPet.location.lng) : "");
    setHealthScore(typeof selectedPet.healthScore === "number" ? selectedPet.healthScore : 80);
    setConnectOptIn(Boolean(selectedPet.connectOptIn));
    setPetConnectVerified(Boolean(selectedPet.petConnectVerified));
    setVerifiedBreeder(Boolean(selectedPet.verifiedBreeder));
    setBoostProfile(Boolean(selectedPet.boostProfile));
    setFilters((f) => ({ ...f, breed: "" }));
  }, [selectedPetId, selectedPet]);

  const saveConnectProfile = async () => {
    if (!token || !selectedPetId) return;
    setSavingProfile(true);
    setPageError("");
    try {
      const latN = lat.trim() === "" ? null : Number(lat);
      const lngN = lng.trim() === "" ? null : Number(lng);
      const { pet } = await api.updatePet(token, selectedPetId, {
        gender,
        healthStatus,
        vaccinationStatus,
        location: {
          city: city.trim(),
          lat: latN,
          lng: lngN
        },
        healthScore,
        connectOptIn,
        petConnectVerified,
        verifiedBreeder,
        boostProfile
      });
      setPets((prev) => prev.map((p) => (p._id === pet._id ? pet : p)));
      setProfileMissing([]);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const applyDemoLocation = (which: "bengaluru" | "mumbai") => {
    if (which === "bengaluru") {
      setCity("Bengaluru");
      setLat("12.9716");
      setLng("77.5946");
    } else {
      setCity("Mumbai");
      setLat("19.076");
      setLng("72.8777");
    }
  };

  const demoVerifyPet = async () => {
    setPetConnectVerified(true);
    if (!token || !selectedPetId) return;
    try {
      const { pet } = await api.updatePet(token, selectedPetId, { petConnectVerified: true });
      setPets((prev) => prev.map((p) => (p._id === pet._id ? pet : p)));
    } catch {
      // state already true locally
    }
  };

  const runMatch = async () => {
    if (!token || !selectedPetId) return;
    setMatching(true);
    setMatchError("");
    setProfileMissing([]);
    setSuggestions([]);
    try {
      const res = await api.matchPets(token, selectedPetId, {
        maxDistanceKm: filters.maxDistanceKm,
        breed: filters.breed.trim(),
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        mode: filters.mode
      });
      setMatches(res.matches);
      setSuggestions(res.suggestions || []);
    } catch (e) {
      const err = e as Error & { code?: string; missing?: string[] };
      if (err.code === "incomplete_profile" && err.missing?.length) {
        setProfileMissing(err.missing);
        setMatchError("Complete your Pet Connect profile to search.");
      } else {
        setMatchError(err instanceof Error ? err.message : "Could not load matches.");
      }
      setMatches([]);
    } finally {
      setMatching(false);
    }
  };

  const sendRequest = async (toPetId: string) => {
    if (!token || !selectedPetId) return;
    setConnectBusyId(toPetId);
    setPageError("");
    try {
      await api.sendConnectRequest(token, selectedPetId, toPetId);
      await loadRequests();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setConnectBusyId("");
    }
  };

  const acceptReq = async (id: string) => {
    if (!token) return;
    await api.acceptConnectRequest(token, id);
    await loadRequests();
  };

  const rejectReq = async (id: string) => {
    if (!token) return;
    await api.rejectConnectRequest(token, id);
    await loadRequests();
  };

  const blockOwner = async (userId: string) => {
    if (!token || !confirm("Block this owner? You will not see each other in Pet Connect.")) return;
    try {
      await api.blockConnectUser(token, userId);
      setMatches((m) => m.filter((x) => x.ownerUserId !== userId));
      await loadRequests();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Block failed");
    }
  };

  const submitReport = async () => {
    if (!token || !reportOpenFor || !reportReason.trim()) return;
    try {
      await api.reportConnectUser(token, {
        userId: reportOpenFor.userId,
        reason: reportReason.trim(),
        targetPetId: reportOpenFor.petId
      });
      setReportOpenFor(null);
      setReportReason("");
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Report failed");
    }
  };

  const openChat = async (connectionId: string) => {
    if (!token) return;
    setChatConnectionId(connectionId);
    setChatLoading(true);
    try {
      const res = await api.getConnectMessages(token, connectionId);
      setChatMessages(res.messages);
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChat = async () => {
    if (!token || !chatConnectionId || !chatInput.trim()) return;
    try {
      await api.postConnectMessage(token, chatConnectionId, chatInput.trim());
      setChatInput("");
      const res = await api.getConnectMessages(token, chatConnectionId);
      setChatMessages(res.messages);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Message failed");
    }
  };

  if (!hydrated || !token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
        <div className="glass-panel w-full p-6 text-center text-sm text-slate-300">Loading…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 md:p-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Pet Connect · verified accounts only
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Pet Connect</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Meet nearby pets for socialization or responsible breeding. Signed-in owners only. Profiles must be healthy, up to date on
            vaccines, and verified for discovery.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Signed in as {user?.email}. Anonymous browsing is disabled for safety.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="/dashboard">
            Dashboard
          </Link>
          <button
            type="button"
            className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
            onClick={() => api.verifyConnectAccountDemo(token).catch(() => undefined)}
          >
            Account check (demo)
          </button>
        </div>
      </header>

      {pageError ? (
        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{pageError}</div>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-1">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold">Your pet</h2>
            <p className="mt-1 text-sm text-slate-300">Select a pet and complete Pet Connect fields.</p>
            {loadingPets ? (
              <p className="mt-4 text-sm text-slate-400">Loading pets…</p>
            ) : pets.length === 0 ? (
              <p className="mt-4 text-sm text-amber-200">
                No pets yet.{" "}
                <Link href="/dashboard" className="underline">
                  Add a pet on the dashboard
                </Link>
                .
              </p>
            ) : (
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="mt-4 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-cyan-400/40 focus:ring-2"
              >
                {pets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} · {p.petType} · {p.breed}
                  </option>
                ))}
              </select>
            )}

            {selectedPet ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-400">
                    Gender
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as PetGender)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </label>
                  <label className="text-xs text-slate-400">
                    Health
                    <select
                      value={healthStatus}
                      onChange={(e) => setHealthStatus(e.target.value as PetHealthStatus)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                    >
                      <option value="healthy">Healthy</option>
                      <option value="under_observation">Under observation</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                </div>
                <label className="block text-xs text-slate-400">
                  Vaccination (Pet Connect)
                  <select
                    value={vaccinationStatus}
                    onChange={(e) => setVaccinationStatus(e.target.value as PetVaccinationConnectStatus)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                  >
                    <option value="up_to_date">Up to date</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>
                <label className="block text-xs text-slate-400">
                  City
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                    placeholder="City"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-400">
                    Latitude
                    <input
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                      placeholder="12.97"
                    />
                  </label>
                  <label className="text-xs text-slate-400">
                    Longitude
                    <input
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                      placeholder="77.59"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-[11px] hover:bg-white/10"
                    onClick={() => applyDemoLocation("bengaluru")}
                  >
                    Demo: Bengaluru coords
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-[11px] hover:bg-white/10"
                    onClick={() => applyDemoLocation("mumbai")}
                  >
                    Demo: Mumbai coords
                  </button>
                </div>
                <label className="block text-xs text-slate-400">
                  Health score (0–100)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={healthScore}
                    onChange={(e) => setHealthScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={connectOptIn} onChange={(e) => setConnectOptIn(e.target.checked)} />
                  Appear in Pet Connect discovery
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={petConnectVerified} onChange={(e) => setPetConnectVerified(e.target.checked)} />
                  Profile verified for Pet Connect
                </label>
                <button
                  type="button"
                  onClick={demoVerifyPet}
                  className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
                >
                  Demo: mark this pet verified
                </button>
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-100/90">
                  <p className="font-semibold text-amber-200">Future-ready</p>
                  <label className="mt-2 flex items-center gap-2">
                    <input type="checkbox" checked={verifiedBreeder} onChange={(e) => setVerifiedBreeder(e.target.checked)} />
                    Verified breeder badge (demo toggle)
                  </label>
                  <label className="mt-2 flex items-center gap-2">
                    <input type="checkbox" checked={boostProfile} onChange={(e) => setBoostProfile(e.target.checked)} />
                    Boost profile (premium preview — extra score in matching)
                  </label>
                </div>
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={saveConnectProfile}
                  className="w-full rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
                >
                  {savingProfile ? "Saving…" : "Save Pet Connect profile"}
                </button>
                {profileMissing.length > 0 ? (
                  <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                    <p className="font-semibold">Still needed for matching:</p>
                    <ul className="mt-1 list-disc pl-4">
                      {profileMissing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold">Requests &amp; chat</h2>
            <p className="mt-1 text-xs text-slate-400">Accept requests to unlock owner chat.</p>
            <div className="mt-3 max-h-48 space-y-2 overflow-auto text-xs">
              <p className="font-semibold text-slate-300">Incoming</p>
              {incoming.length === 0 ? <p className="text-slate-500">None</p> : null}
              {incoming.map((r) => {
                const from = briefPet(r.fromPetId);
                return (
                  <div key={r._id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p>
                      {from.name} ({from.breed})
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button type="button" className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-200" onClick={() => acceptReq(r._id)}>
                        Accept
                      </button>
                      <button type="button" className="rounded border border-white/20 px-2 py-1" onClick={() => rejectReq(r._id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
              <p className="mt-2 font-semibold text-slate-300">Accepted</p>
              {accepted.length === 0 ? <p className="text-slate-500">None yet</p> : null}
              {accepted.map((r) => {
                const a = briefPet(r.fromPetId);
                const b = briefPet(r.toPetId);
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => openChat(r._id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-2 py-2 text-left ${
                      chatConnectionId === r._id ? "border-cyan-400/50 bg-cyan-500/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <span>
                      {a.name} ↔ {b.name}
                    </span>
                    <MessageCircle className="h-4 w-4 text-cyan-300" />
                  </button>
                );
              })}
            </div>

            {chatConnectionId ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-xs font-semibold text-slate-300">Owner chat</p>
                <div className="mt-2 max-h-40 space-y-1 overflow-auto text-xs">
                  {chatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    chatMessages.map((m) => (
                      <div
                        key={m._id}
                        className={`rounded-lg px-2 py-1 ${
                          String(m.senderUserId) === String(user?.id) ? "ml-4 bg-cyan-500/20 text-right" : "mr-4 bg-white/10"
                        }`}
                      >
                        {m.body}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message…"
                    className="flex-1 rounded-lg border border-white/15 bg-slate-950/60 px-2 py-1.5 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                  />
                  <button type="button" onClick={sendChat} className="rounded-lg bg-cyan-400 px-2 py-1 text-slate-900">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Filters</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Pet type is fixed to your selected pet ({selectedPet?.petType || "—"}). Breeding mode requires opposite sexes and safe ages.
                </p>
              </div>
              <button
                type="button"
                onClick={runMatch}
                disabled={matching || !selectedPetId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Find matches
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs text-slate-400">
                Max distance (km)
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={filters.maxDistanceKm}
                  onChange={(e) => setFilters((f) => ({ ...f, maxDistanceKm: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Breed (optional exact)
                <select
                  value={filters.breed}
                  onChange={(e) => setFilters((f) => ({ ...f, breed: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                >
                  <option value="">Any (prioritize same breed in score)</option>
                  {breedOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Mode
                <select
                  value={filters.mode}
                  onChange={(e) => setFilters((f) => ({ ...f, mode: e.target.value as "social" | "breeding" }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                >
                  <option value="social">Socialization</option>
                  <option value="breeding">Responsible breeding</option>
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Min age
                <input
                  type="number"
                  min={0}
                  value={filters.minAge}
                  onChange={(e) => setFilters((f) => ({ ...f, minAge: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Max age
                <input
                  type="number"
                  min={0}
                  value={filters.maxAge}
                  onChange={(e) => setFilters((f) => ({ ...f, maxAge: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 text-sm"
                />
              </label>
            </div>
            {matchError ? (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {matchError}
              </div>
            ) : null}
            {suggestions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                    <Sparkles className="h-3 w-3" />
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Compatible pets</h2>
              <button type="button" onClick={runMatch} className="text-xs text-cyan-300 hover:underline">
                <RefreshCw className="mr-1 inline h-3 w-3" />
                Refresh
              </button>
            </div>
            {matches.length === 0 && !matching ? (
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                <p>No matches yet. Adjust filters, complete your profile, or try again later.</p>
                <p className="mt-2 text-xs">Only healthy, up-to-date, and verified pets appear. Others must opt in from their profile.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {matches.map((m) => (
                  <article key={m.petId} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                        {m.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.profileImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <UserRound className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-50">{m.petName}</p>
                            <p className="text-xs text-slate-400">{m.breed}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-mono text-cyan-200">
                            {m.compatibilityScore}%
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" /> {m.distance}
                        </p>
                        <p className="text-xs text-slate-500">
                          Age {m.age} · {m.healthStatus}
                          {m.verifiedBreeder ? (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-amber-200">
                              <BadgeCheck className="h-3 w-3" /> Breeder
                            </span>
                          ) : null}
                          {m.boostProfile ? (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-violet-200">
                              <Zap className="h-3 w-3" /> Boost
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={connectBusyId === m.petId}
                        onClick={() => sendRequest(m.petId)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
                      >
                        <Heart className="h-3.5 w-3.5" />
                        {connectBusyId === m.petId ? "…" : "Connect"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportOpenFor({ userId: m.ownerUserId, petId: m.petId })}
                        className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
                      >
                        Report
                      </button>
                      <button
                        type="button"
                        onClick={() => blockOwner(m.ownerUserId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-400/40 px-3 py-2 text-xs text-rose-200 hover:bg-rose-500/10"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Block
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {outgoing.length > 0 ? (
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-slate-300">Outgoing requests</h3>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {outgoing.map((r) => (
                  <li key={r._id}>
                    To {briefPet(r.toPetId).name} — pending
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {reportOpenFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Report user</h3>
            <p className="mt-1 text-xs text-slate-400">Our team reviews reports. Misuse may lead to account action.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mt-3 w-full rounded-lg border border-white/15 bg-slate-950/80 p-2 text-sm"
              rows={4}
              placeholder="Describe the issue…"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-xs" onClick={() => setReportOpenFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                onClick={submitReport}
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
