"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function RedirectToStart() {
  const router = useRouter();
  const { token, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hydrated, token, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
      <div className="glass-panel w-full p-6 text-center text-sm text-slate-300">Loading…</div>
    </main>
  );
}

