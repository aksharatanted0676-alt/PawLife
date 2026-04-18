"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <form onSubmit={submit} className="glass-panel w-full space-y-4 p-6">
        <h1 className="text-2xl font-bold">PawLife AI</h1>
        <p className="text-sm text-slate-300">Login to manage pets, reminders, and chat with the assistant.</p>
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
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-400 p-2 font-semibold text-slate-900 disabled:opacity-70">
          {loading ? "Logging in…" : "Login"}
        </button>
        <p className="text-xs text-slate-300">
          New here?{" "}
          <Link className="text-cyan-200 underline-offset-2 hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}

