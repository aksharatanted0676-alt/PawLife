"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PetType } from "@/lib/types";
import { breedOptionsByPet } from "@/lib/petOptions";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pet, setPet] = useState({
    name: "",
    petType: "dog" as PetType,
    breed: breedOptionsByPet.dog[0],
    ageYears: 1,
    weightKg: 1,
    gender: "female" as "female" | "male"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const breedOptions = useMemo(() => breedOptionsByPet[pet.petType], [pet.petType]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signup(form);
      // Create the first pet profile right after signup (beginner-friendly onboarding)
      await api.addPet(res.token, {
        name: pet.name,
        petType: pet.petType,
        breed: pet.breed,
        ageYears: pet.ageYears,
        weightKg: pet.weightKg,
        medicalHistory: [],
        vaccinationRecords: [],
        profileImageUrl: ""
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <form onSubmit={submit} className="glass-panel w-full space-y-4 p-6">
        <h1 className="text-2xl font-bold">PawLife AI</h1>
        <p className="text-sm text-slate-300">Create your account to start tracking pet health.</p>
        <input
          className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2"
          placeholder="Password (min 6)"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
        />

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-200">Pet details (for your dashboard)</p>
          <div className="grid gap-2">
            <input
              className="w-full rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
              placeholder="Pet name"
              value={pet.name}
              onChange={(e) => setPet((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={pet.petType}
                onChange={(e) => {
                  const petType = e.target.value as PetType;
                  setPet((p) => ({ ...p, petType, breed: breedOptionsByPet[petType][0] || "" }));
                }}
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
              </select>
              <select
                value={pet.breed}
                onChange={(e) => setPet((p) => ({ ...p, breed: e.target.value }))}
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
              >
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min={0}
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
                placeholder="Age (yrs)"
                value={pet.ageYears}
                onChange={(e) => setPet((p) => ({ ...p, ageYears: Number(e.target.value) }))}
              />
              <input
                type="number"
                min={0}
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
                placeholder="Weight (kg)"
                value={pet.weightKg}
                onChange={(e) => setPet((p) => ({ ...p, weightKg: Number(e.target.value) }))}
              />
              <select
                value={pet.gender}
                onChange={(e) => setPet((p) => ({ ...p, gender: e.target.value as "female" | "male" }))}
                className="rounded-lg border border-white/20 bg-slate-900/50 p-2 text-sm"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-400 p-2 font-semibold text-slate-900 disabled:opacity-70">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-xs text-slate-300">
          Already have an account?{" "}
          <Link className="text-cyan-200 underline-offset-2 hover:underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

