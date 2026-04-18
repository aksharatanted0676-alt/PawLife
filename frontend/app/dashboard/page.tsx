"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PawPrint, Plus, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { breedOptionsByPet } from "@/lib/petOptions";
import type { DietMeal, InAppNotification, PetGender, PetProfile, PetType, Reminder } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import Link from "next/link";
import { getPlan, maxMealsAllowedForTier, userTier } from "@/lib/subscription";

type DietFormRow = {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
  label: string;
  time: string;
  calories: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, hydrated, refreshUser } = useAuth();

  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [editingPetId, setEditingPetId] = useState("");
  const [newPet, setNewPet] = useState({
    name: "",
    petType: "dog" as PetType,
    breed: breedOptionsByPet.dog[0],
    ageYears: 1,
    weightKg: 1,
    gender: "unknown" as PetGender,
    birthdate: ""
  });

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "bot", text: "Hi, I am PawLife AI. Ask about symptoms, diet, vaccination schedule, or care." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    type: "custom" as Reminder["type"],
    remindAt: ""
  });

  const [error, setError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [activityMinutes, setActivityMinutes] = useState(20);
  const [activitySavedAt, setActivitySavedAt] = useState<string>("");

  const [dietMeals, setDietMeals] = useState<DietFormRow[]>([]);
  const [dietCalories, setDietCalories] = useState(0);
  const [dietWaterMl, setDietWaterMl] = useState(0);
  const [dietNotes, setDietNotes] = useState("");
  const [dietId, setDietId] = useState<string | null>(null);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietSaving, setDietSaving] = useState(false);

  const tier = userTier(user);
  const planMeta = getPlan(tier);
  const mealLimit = maxMealsAllowedForTier(tier);
  const maxPetsAllowed = planMeta.features.maxPets;
  const canAddAnotherPet = pets.length < maxPetsAllowed;
  const isAddingNewPet = !editingPetId;

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getPets(token), api.getReminders(token), api.getNotifications(token)])
      .then(([petRes, reminderRes, notifRes]) => {
        setPets(petRes.pets);
        setReminders(reminderRes.reminders);
        setUnreadCount(notifRes.unreadCount);
        setNotifications(notifRes.notifications);
        if (petRes.pets[0]) setSelectedPetId((prev) => prev || petRes.pets[0]._id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = window.setInterval(() => {
      api
        .getNotifications(token)
        .then((res) => {
          setUnreadCount(res.unreadCount);
          setNotifications(res.notifications);
        })
        .catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(interval);
  }, [token]);

  const selectedPet = useMemo(() => pets.find((p) => p._id === selectedPetId) || null, [pets, selectedPetId]);
  const breedOptions = breedOptionsByPet[newPet.petType];

  const upcomingVaccines = useMemo(() => {
    if (!selectedPet) return [];
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return (selectedPet.vaccinationRecords || [])
      .filter((v) => v.status !== "done")
      .map((v) => ({ ...v, due: new Date(v.dueDate) }))
      .filter((v) => !Number.isNaN(v.due.getTime()) && v.due <= in30)
      .sort((a, b) => a.due.getTime() - b.due.getTime())
      .slice(0, 5);
  }, [selectedPet]);

  const isWeeklyDiet = useMemo(() => dietMeals.some((m) => Boolean(m.day?.trim())), [dietMeals]);

  useEffect(() => {
    if (!selectedPet) return;
    const key = `pawlife_activity_${selectedPet._id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { minutes: number; savedAt: string };
        if (typeof parsed.minutes === "number") setActivityMinutes(parsed.minutes);
        if (typeof parsed.savedAt === "string") setActivitySavedAt(parsed.savedAt);
      } catch {
        // ignore
      }
    } else {
      setActivitySavedAt("");
    }
  }, [selectedPetId, selectedPet]);

  useEffect(() => {
    if (!token || !selectedPet) return;
    setDietLoading(true);
    api
      .getDiet(token, selectedPet._id)
      .then((res) => {
        if (res.diet) {
          setDietId(res.diet._id);
          setDietMeals(
            (res.diet.meals || []).map((m: DietMeal) => ({
              day: m.day || "",
              morning: m.morning || "",
              afternoon: m.afternoon || "",
              evening: m.evening || "",
              label: m.label || "",
              time: m.time || "",
              calories: m.calories != null ? String(m.calories) : ""
            }))
          );
          setDietCalories(res.diet.calories);
          setDietWaterMl(typeof res.diet.waterIntakeMl === "number" ? res.diet.waterIntakeMl : 0);
          setDietNotes(res.diet.notes || "");
        } else {
          setDietId(null);
          setDietMeals([]);
          setDietCalories(0);
          setDietWaterMl(0);
          setDietNotes("");
        }
      })
      .catch(() => {
        setDietId(null);
        setDietMeals([]);
      })
      .finally(() => setDietLoading(false));
  }, [token, selectedPetId, selectedPet]);

  const onAddOrUpdatePet = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be signed in to save a pet.");
      return;
    }
    if (isAddingNewPet && !canAddAnotherPet) {
      setError(`Your plan allows ${maxPetsAllowed} pet(s). Upgrade on the Subscription page.`);
      return;
    }
    setError("");
    const payload = {
      ...newPet,
      birthdate: newPet.birthdate ? newPet.birthdate : undefined,
      medicalHistory: [],
      vaccinationRecords: []
    };
    try {
      const response = editingPetId ? await api.updatePet(token, editingPetId, payload) : await api.addPet(token, payload);
      if (editingPetId) {
        setPets((prev) => prev.map((p) => (p._id === editingPetId ? response.pet : p)));
        setEditingPetId("");
      } else {
        setPets((prev) => [response.pet, ...prev]);
        setSelectedPetId(response.pet._id);
        await refreshUser();
        const notifRes = await api.getNotifications(token);
        setUnreadCount(notifRes.unreadCount);
        setNotifications(notifRes.notifications);
      }
      setNewPet({
        name: "",
        petType: "dog",
        breed: breedOptionsByPet.dog[0],
        ageYears: 1,
        weightKg: 1,
        gender: "unknown",
        birthdate: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pet");
    }
  };

  const startEditPet = (pet: PetProfile) => {
    setEditingPetId(pet._id);
    setNewPet({
      name: pet.name,
      petType: pet.petType,
      breed: pet.breed,
      ageYears: pet.ageYears,
      weightKg: pet.weightKg,
      gender: pet.gender || "unknown",
      birthdate: pet.birthdate ? String(pet.birthdate).slice(0, 10) : ""
    });
  };

  const onDeletePet = async (petId: string) => {
    if (!token) return;
    setError("");
    try {
      await api.deletePet(token, petId);
      const remaining = pets.filter((p) => p._id !== petId);
      setPets(remaining);
      if (selectedPetId === petId) setSelectedPetId(remaining[0]?._id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pet");
    }
  };

  const sendChat = async (input?: string) => {
    if (!token || !selectedPet || chatLoading) return;
    const message = (input || chatInput).trim();
    if (!message) return;
    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await api.askChat(token, message, selectedPet);
      setChatMessages((prev) => [...prev, { role: "bot", text: response.reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: err instanceof Error ? `Sorry — ${err.message}` : "Sorry — chat failed." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const addReminder = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPet) return;
    setError("");
    try {
      const created = await api.addReminder(token, { ...reminderForm, petId: selectedPet._id });
      setReminders((prev) => [...prev, created.reminder]);
      // unread count represents sent notifications, not scheduled reminders; refresh from server
      const notifRes = await api.getNotifications(token);
      setUnreadCount(notifRes.unreadCount);
      setReminderForm({ title: "", type: "custom", remindAt: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add reminder");
    }
  };

  const markReminder = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await api.markReminderRead(token, id);
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, read: true } : r)));
      const notifRes = await api.getNotifications(token);
      setUnreadCount(notifRes.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark reminder read");
    }
  };

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
        <div className="glass-panel w-full p-6 text-center text-sm text-slate-300">Loading…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 md:p-10">
      <AppHeader unreadCount={unreadCount} onOpenNotifications={() => setNotificationsOpen(true)} />

      <p className="mb-4 text-sm text-slate-400">
        Subscription: <span className="font-semibold text-cyan-200">{planMeta.name}</span>
        {user?.subscriptionExpiry ? (
          <span> · Paid access through {new Date(user.subscriptionExpiry).toLocaleDateString()}</span>
        ) : null}
        .{" "}
        <Link href="/pricing" className="text-cyan-300 underline-offset-2 hover:underline">
          Change plan
        </Link>
      </p>

      <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/pricing" className="glass-panel p-4 text-sm hover:bg-white/10">
          <p className="font-semibold">Subscription</p>
          <p className="mt-1 text-slate-300">Compare plans and simulate checkout.</p>
        </Link>
        <Link href="/pet-health-scan" className="glass-panel p-4 text-sm hover:bg-white/10">
          <p className="font-semibold">Pet Health Scan</p>
          <p className="mt-1 text-slate-300">AI-style image check by species (simulated).</p>
        </Link>
        <Link href="/allergy-scan" className="glass-panel p-4 text-sm hover:bg-white/10">
          <p className="font-semibold">Skin Allergy Scan</p>
          <p className="mt-1 text-slate-300">Upload an image and get simulated insights.</p>
        </Link>
        <Link href="/matchmaking" className="glass-panel p-4 text-sm hover:bg-white/10">
          <p className="font-semibold">Pet Connect</p>
          <p className="mt-1 text-slate-300">Requests, chat, and verified discovery.</p>
        </Link>
        <Link href={"/mate-finder" as never} className="glass-panel p-4 text-sm hover:bg-white/10">
          <p className="font-semibold">Mate Finder</p>
          <p className="mt-1 text-slate-300">Compatibility profiles — Elite only.</p>
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Link href="/sos" className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-95">
          Emergency SOS
          </Link>
          <Link href="/chatbot" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">
            Simple Chatbot
          </Link>
          <Link href="/records" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">
            Medical Records
          </Link>
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">
            Explore
          </Link>
        </div>
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllRead={async () => {
          if (!token) return;
          await api.markAllNotificationsRead(token);
          const res = await api.getNotifications(token);
          setUnreadCount(res.unreadCount);
          setNotifications(res.notifications);
        }}
        onMarkOneRead={async (id) => {
          if (!token) return;
          await api.markNotificationRead(token, id);
          const res = await api.getNotifications(token);
          setUnreadCount(res.unreadCount);
          setNotifications(res.notifications);
        }}
      />

      {error ? (
        /PET_LIMIT|SUBSCRIPTION_REQUIRED|plan allows|requires/i.test(error) ? (
          <div className="mb-4">
            <UpgradeBanner
              title="This action needs a higher plan"
              detail={error}
              requiredTier={/Elite|elite|water intake/i.test(error) ? "elite" : "pro"}
            />
          </div>
        ) : (
          <p className="mb-4 text-red-300">{error}</p>
        )
      ) : null}

      <section className="glass-panel mb-6 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-slate-300">Pet Switching System</p>
            <div className="flex flex-wrap gap-2">
              {pets.length === 0 ? (
                <p className="w-full text-sm text-slate-400">No pets yet. Add your first pet using the form on the right.</p>
              ) : null}
              {pets.map((pet) => (
                <button
                  key={pet._id}
                  onClick={() => setSelectedPetId(pet._id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    selectedPetId === pet._id ? "border-cyan-300 bg-cyan-500/20" : "border-white/20"
                  }`}
                >
                  <PawPrint className="h-4 w-4" />
                  {pet.name} ({pet.petType}) · {pet.breed}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={onAddOrUpdatePet} className="grid gap-2 rounded-xl bg-white/5 p-3">
            <p className="text-sm text-slate-300">{editingPetId ? "Edit Pet" : "Add Pet"}</p>
            {isAddingNewPet && !canAddAnotherPet ? (
              <p className="text-xs text-amber-200">
                Pet limit reached ({maxPetsAllowed} on {planMeta.name}).{" "}
                <Link href="/pricing" className="underline">
                  Upgrade
                </Link>
                .
              </p>
            ) : null}
            <input
              value={newPet.name}
              onChange={(e) => setNewPet((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
              className="rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <select
                value={newPet.petType}
                onChange={(e) => {
                  const petType = e.target.value as PetType;
                  setNewPet((p) => ({ ...p, petType, breed: breedOptionsByPet[petType][0] || "" }));
                }}
                className="rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
              </select>
              <select
                value={newPet.breed}
                onChange={(e) => setNewPet((p) => ({ ...p, breed: e.target.value }))}
                className="rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              >
                {breedOptions.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={newPet.ageYears}
                onChange={(e) => setNewPet((p) => ({ ...p, ageYears: Number(e.target.value) }))}
                className="rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                placeholder="Age"
                min={0}
              />
              <input
                type="number"
                value={newPet.weightKg}
                onChange={(e) => setNewPet((p) => ({ ...p, weightKg: Number(e.target.value) }))}
                className="rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                placeholder="Weight"
                min={0}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] text-slate-400">Gender</p>
                <div className="flex flex-wrap gap-2">
                  {(["male", "female", "unknown"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewPet((p) => ({ ...p, gender: g }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs ${
                        newPet.gender === g ? "border-cyan-400 bg-cyan-500/20 text-cyan-100" : "border-white/20 text-slate-300"
                      }`}
                    >
                      {g === "unknown" ? "Unknown" : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <label className="text-[11px] text-slate-400">
                Birthdate (optional)
                <input
                  type="date"
                  value={newPet.birthdate}
                  onChange={(e) => setNewPet((p) => ({ ...p, birthdate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isAddingNewPet && !canAddAnotherPet}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {editingPetId ? "Update Pet" : "Save Pet"}
              </button>
              {editingPetId ? (
                <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-sm" onClick={() => setEditingPetId("")}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">Pet Profiles</h2>
          <div className="space-y-3">
            {pets.map((pet) => (
              <div key={pet._id} className="rounded-xl bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {pet.name} - {pet.petType}
                    </p>
                    <p className="text-sm text-slate-300">
                      {pet.breed} · {pet.ageYears} years · {pet.weightKg} kg · {pet.gender || "unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded border border-white/20 px-2 py-1 text-xs" onClick={() => startEditPet(pet)}>
                      Edit
                    </button>
                    <button className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-200" onClick={() => onDeletePet(pet._id)} aria-label="Delete pet">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-300">
                  <p>Medical history records: {pet.medicalHistory.length}</p>
                  <p>Vaccination records: {pet.vaccinationRecords.length}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="tel:+911234567890" className="mt-4 inline-block rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold">
            Emergency Vet Contact
          </a>

          {selectedPet ? (
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <p className="text-xs text-slate-300">Selected pet</p>
                <p className="font-semibold">
                  {selectedPet.name} · {selectedPet.breed}
                </p>
                <p className="text-xs text-slate-300">
                  {selectedPet.ageYears} yrs · {selectedPet.weightKg} kg · {selectedPet.gender || "unknown"}
                </p>
              </div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold text-slate-200">Upcoming vaccinations (next 30 days)</p>
                {upcomingVaccines.length === 0 ? (
                  <p className="text-xs text-slate-300">No upcoming vaccinations found.</p>
                ) : (
                  upcomingVaccines.map((v) => (
                    <div key={v._id || `${v.vaccine}-${v.dueDate}`} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                      <span className="text-slate-200">{v.vaccine}</span>
                      <span className="text-slate-300">{new Date(v.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel flex h-[560px] flex-col p-5">
          <h2 className="mb-3 text-lg font-semibold">AI Chatbot (Gemini)</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {["My dog is not eating", "Vaccination schedule", "Symptoms checker"].map((prompt) => (
              <button key={prompt} className="rounded-full border border-white/20 px-3 py-1 text-xs" onClick={() => sendChat(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="mb-3 flex-1 space-y-2 overflow-auto rounded-xl bg-slate-900/40 p-3">
            {chatMessages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "ml-auto bg-cyan-500 text-slate-900" : "bg-white/10"}`}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading ? (
              <div className="max-w-[60%] rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200">Typing…</div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={selectedPet ? `Ask about ${selectedPet.name}…` : "Select a pet to start chatting…"}
              className="flex-1 rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              disabled={!selectedPet || chatLoading}
            />
            <button
              onClick={() => sendChat()}
              disabled={!selectedPet || chatLoading}
              className="rounded-lg bg-cyan-500 p-2 text-slate-900 disabled:opacity-60"
              aria-label="Send chat"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">Notifications & Reminders</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { label: "Medicine (today 8pm)", type: "medication" as const, title: "Medicine dose", hoursFromNow: 2 },
              { label: "Vaccine (tomorrow)", type: "vaccination" as const, title: "Vaccination reminder", hoursFromNow: 24 },
              { label: "Grooming (weekend)", type: "grooming" as const, title: "Grooming session", hoursFromNow: 72 }
            ].map((preset) => (
              <button
                key={preset.label}
                className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                onClick={() => {
                  const dt = new Date(Date.now() + preset.hoursFromNow * 60 * 60 * 1000);
                  const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setReminderForm({ title: preset.title, type: preset.type as Reminder["type"], remindAt: isoLocal });
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <form onSubmit={addReminder} className="mb-4 grid gap-2 md:grid-cols-4">
            <input
              value={reminderForm.title}
              onChange={(e) => setReminderForm((r) => ({ ...r, title: e.target.value }))}
              placeholder="Reminder title"
              className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
              required
            />
            <select
              value={reminderForm.type}
              onChange={(e) => setReminderForm((r) => ({ ...r, type: e.target.value as Reminder["type"] }))}
              className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
            >
              <option value="vaccination">Vaccination</option>
              <option value="appointment">Vet Appointment</option>
              <option value="medication">Medication</option>
              <option value="grooming">Grooming</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="datetime-local"
              value={reminderForm.remindAt}
              onChange={(e) => setReminderForm((r) => ({ ...r, remindAt: e.target.value }))}
              className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900">Set Reminder</button>
          </form>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder._id} className="flex items-center justify-between rounded-lg bg-white/5 p-2 text-sm">
                <div>
                  <p>{reminder.title}</p>
                  <p className="text-xs text-slate-300">
                    {reminder.type} · {new Date(reminder.remindAt).toLocaleString()}
                  </p>
                </div>
                {!reminder.read ? (
                  <button className="rounded border border-cyan-400/50 px-2 py-1 text-xs" onClick={() => markReminder(reminder._id)}>
                    Mark read
                  </button>
                ) : (
                  <span className="text-xs text-emerald-300">Read</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">Health, Diet & Activity</h2>
          {!selectedPet ? (
            <p className="text-sm text-slate-300">Select a pet to view timeline.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-slate-200">Diet plan</p>
                {selectedPet ? (
                  <>
                    <p className="mt-1 text-sm text-slate-200">
                      <span className="font-semibold">{selectedPet.name}</span> · {selectedPet.petType} · {selectedPet.breed}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Target calories: <span className="font-semibold text-cyan-200">{dietCalories || "—"}</span>
                      {" · "}
                      Water (ml/day): <span className="font-semibold text-cyan-200">{dietWaterMl || "—"}</span>
                      {typeof selectedPet.weightKg === "number" ? ` · Weight ${selectedPet.weightKg} kg` : ""}
                    </p>
                    {dietNotes ? (
                      <p className="mt-2 rounded-lg bg-slate-900/40 p-2 text-xs text-slate-300">{dietNotes}</p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Plan notes from the server appear here.</p>
                    )}
                    <p className="mt-2 text-[11px] text-slate-400">
                      {tier === "free"
                        ? "Free: view the auto-generated plan. Upgrade to Pro to edit and save."
                        : tier === "pro"
                          ? `Pro: edit up to ${mealLimit} meal rows and save.`
                          : `Elite: edit meals, notes, and water (up to ${mealLimit} rows).`}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-300">Select a pet to load diet data.</p>
                )}

                {selectedPet ? (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-xs font-semibold text-slate-200">Meal schedule (saved to server)</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {isWeeklyDiet ? "Weekly grid (auto-generated template)." : "Simple meal list (legacy or custom)."}
                    </p>
                    {dietLoading ? (
                      <p className="mt-2 text-xs text-slate-400">Loading diet…</p>
                    ) : (
                      <>
                        {isWeeklyDiet ? (
                          <div className="mt-2 overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-left text-[11px]">
                              <thead>
                                <tr className="border-b border-white/10 text-slate-400">
                                  <th className="py-2 pr-2">Day</th>
                                  <th className="py-2 pr-2">Morning</th>
                                  <th className="py-2 pr-2">Afternoon</th>
                                  <th className="py-2 pr-2">Evening</th>
                                  <th className="py-2">Cal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dietMeals.map((row, idx) => (
                                  <tr key={idx} className="border-b border-white/5 align-top">
                                    <td className="py-1 pr-2">
                                      <input
                                        readOnly={tier === "free"}
                                        className="w-full rounded border border-white/15 bg-slate-900/50 px-1 py-1"
                                        value={row.day}
                                        onChange={(e) =>
                                          setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, day: e.target.value } : r)))
                                        }
                                      />
                                    </td>
                                    <td className="py-1 pr-2">
                                      <textarea
                                        readOnly={tier === "free"}
                                        className="min-h-[48px] w-full rounded border border-white/15 bg-slate-900/50 px-1 py-1"
                                        value={row.morning}
                                        onChange={(e) =>
                                          setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, morning: e.target.value } : r)))
                                        }
                                      />
                                    </td>
                                    <td className="py-1 pr-2">
                                      <textarea
                                        readOnly={tier === "free"}
                                        className="min-h-[48px] w-full rounded border border-white/15 bg-slate-900/50 px-1 py-1"
                                        value={row.afternoon}
                                        onChange={(e) =>
                                          setDietMeals((rows) =>
                                            rows.map((r, i) => (i === idx ? { ...r, afternoon: e.target.value } : r))
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="py-1 pr-2">
                                      <textarea
                                        readOnly={tier === "free"}
                                        className="min-h-[48px] w-full rounded border border-white/15 bg-slate-900/50 px-1 py-1"
                                        value={row.evening}
                                        onChange={(e) =>
                                          setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, evening: e.target.value } : r)))
                                        }
                                      />
                                    </td>
                                    <td className="py-1">
                                      <input
                                        readOnly={tier === "free"}
                                        className="w-16 rounded border border-white/15 bg-slate-900/50 px-1 py-1"
                                        value={row.calories}
                                        onChange={(e) =>
                                          setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, calories: e.target.value } : r)))
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {dietMeals.map((row, idx) => (
                              <div key={idx} className="grid gap-2 rounded-lg bg-white/5 p-2 md:grid-cols-4">
                                <input
                                  readOnly={tier === "free"}
                                  className="rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-xs"
                                  placeholder="Food item"
                                  value={row.label}
                                  onChange={(e) =>
                                    setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))
                                  }
                                />
                                <input
                                  readOnly={tier === "free"}
                                  className="rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-xs"
                                  placeholder="Cal (opt)"
                                  value={row.calories}
                                  onChange={(e) =>
                                    setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, calories: e.target.value } : r)))
                                  }
                                />
                                <input
                                  readOnly={tier === "free"}
                                  className="rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-xs"
                                  placeholder="Time"
                                  value={row.time}
                                  onChange={(e) =>
                                    setDietMeals((rows) => rows.map((r, i) => (i === idx ? { ...r, time: e.target.value } : r)))
                                  }
                                />
                                {tier !== "free" ? (
                                  <button
                                    type="button"
                                    className="rounded border border-white/20 px-2 py-1 text-[11px] hover:bg-white/10"
                                    onClick={() => setDietMeals((rows) => rows.filter((_, i) => i !== idx))}
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-500">—</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {!isWeeklyDiet && tier !== "free" ? (
                          <button
                            type="button"
                            className="mt-2 rounded-lg border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                            onClick={() => {
                              if (dietMeals.length >= mealLimit) {
                                setError(`Meal limit reached (${mealLimit}). Upgrade for more rows.`);
                                return;
                              }
                              setDietMeals((rows) => [
                                ...rows,
                                { day: "", morning: "", afternoon: "", evening: "", label: "", time: "", calories: "" }
                              ]);
                            }}
                          >
                            Add food item
                          </button>
                        ) : null}
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <label className="text-[11px] text-slate-400">
                            Total calories (target)
                            <input
                              type="number"
                              min={0}
                              readOnly={tier === "free"}
                              className="mt-1 w-full rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-sm disabled:opacity-60"
                              value={dietCalories}
                              onChange={(e) => setDietCalories(Number(e.target.value))}
                            />
                          </label>
                          {tier === "elite" ? (
                            <label className="text-[11px] text-slate-400">
                              Water intake (ml/day)
                              <input
                                type="number"
                                min={0}
                                className="mt-1 w-full rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-sm"
                                value={dietWaterMl}
                                onChange={(e) => setDietWaterMl(Number(e.target.value))}
                              />
                            </label>
                          ) : null}
                          <label className={`text-[11px] text-slate-400 ${tier === "elite" ? "md:col-span-2" : ""}`}>
                            Notes {tier === "free" ? "(Pro+)" : ""}
                            <textarea
                              className="mt-1 w-full rounded border border-white/15 bg-slate-900/50 px-2 py-1 text-sm disabled:opacity-50"
                              rows={2}
                              readOnly={tier === "free"}
                              disabled={tier === "free"}
                              value={dietNotes}
                              onChange={(e) => setDietNotes(e.target.value)}
                              placeholder={tier === "free" ? "Upgrade to Pro to add notes" : "Allergies, vet notes…"}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={dietSaving || !token || tier === "free"}
                          className="mt-3 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
                          onClick={async () => {
                            if (!token || !selectedPet) return;
                            setDietSaving(true);
                            setError("");
                            try {
                              const mealsPayload = isWeeklyDiet
                                ? dietMeals
                                    .filter(
                                      (m) =>
                                        m.day.trim() ||
                                        m.morning.trim() ||
                                        m.afternoon.trim() ||
                                        m.evening.trim() ||
                                        m.calories.trim()
                                    )
                                    .map((m) => ({
                                      day: m.day.trim(),
                                      morning: m.morning.trim(),
                                      afternoon: m.afternoon.trim(),
                                      evening: m.evening.trim(),
                                      calories: m.calories.trim() ? Number(m.calories) : null
                                    }))
                                : dietMeals
                                    .filter((m) => m.label.trim())
                                    .map((m) => ({
                                      label: m.label.trim(),
                                      calories: m.calories.trim() ? Number(m.calories) : null,
                                      time: m.time.trim()
                                    }));
                              const res = await api.saveDiet(token, {
                                petId: selectedPet._id,
                                meals: mealsPayload,
                                calories: dietCalories,
                                notes: dietNotes,
                                ...(tier === "elite" ? { waterIntakeMl: dietWaterMl } : {})
                              });
                              setDietId(res.diet._id);
                              setDietWaterMl(typeof res.diet.waterIntakeMl === "number" ? res.diet.waterIntakeMl : dietWaterMl);
                              const notifRes = await api.getNotifications(token);
                              setUnreadCount(notifRes.unreadCount);
                              setNotifications(notifRes.notifications);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Diet save failed");
                            } finally {
                              setDietSaving(false);
                            }
                          }}
                        >
                          {tier === "free" ? "Upgrade to customize" : dietSaving ? "Saving…" : "Save diet"}
                        </button>
                        {tier !== "free" && dietId ? (
                          <p className="mt-2 text-[10px] text-slate-500">Diet document id: {dietId}</p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-slate-200">Activity tracker</p>
                <p className="mt-1 text-xs text-slate-300">Log daily activity minutes (demo, stored locally per pet).</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    className="w-28 rounded-lg border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
                    value={activityMinutes}
                    onChange={(e) => setActivityMinutes(Number(e.target.value))}
                  />
                  <button
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-900"
                    onClick={() => {
                      if (!selectedPet) return;
                      const key = `pawlife_activity_${selectedPet._id}`;
                      const savedAt = new Date().toISOString();
                      localStorage.setItem(key, JSON.stringify({ minutes: activityMinutes, savedAt }));
                      setActivitySavedAt(savedAt);
                    }}
                  >
                    Save
                  </button>
                  {activitySavedAt ? <span className="text-xs text-slate-400">Saved</span> : null}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-200">Health history timeline</p>
                {selectedPet.medicalHistory.length === 0 ? (
                  <p className="text-slate-300">No medical entries yet.</p>
                ) : (
                  selectedPet.medicalHistory.map((entry) => (
                    <div key={entry._id || `${entry.date}-${entry.note}`} className="rounded-lg bg-white/5 p-2">
                      <p className="font-medium">{entry.date}</p>
                      <p className="text-xs text-slate-300">{entry.type}</p>
                      <p>{entry.note}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-lg bg-white/5 p-2 text-xs text-slate-300">
                <p className="mb-2 font-medium text-slate-200">Upload pet reports (PDF/images)</p>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    className="text-xs"
                    disabled={uploadingReport}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !token || !selectedPet) return;
                      setUploadingReport(true);
                      setError("");
                      try {
                        const res = await api.uploadReport(token, selectedPet._id, file);
                        setPets((prev) => prev.map((p) => (p._id === selectedPet._id ? res.pet : p)));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploadingReport(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="text-xs text-slate-300">{uploadingReport ? "Uploading…" : "Max 5MB. PDF/PNG/JPG/WebP."}</span>
                </div>
                {selectedPet.reports && selectedPet.reports.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-slate-200">Reports</p>
                    {selectedPet.reports.slice(0, 5).map((url) => (
                      <a key={url} className="block truncate text-xs text-cyan-200 underline-offset-2 hover:underline" href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="mt-4 text-xs text-slate-400">Push notifications will be added on top of these in-app alerts and scheduled backend reminders.</p>
    </main>
  );
}

