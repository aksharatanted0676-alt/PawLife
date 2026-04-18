"use client";

import { Bell, Moon, PawPrint, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { SubscriptionBadge } from "./SubscriptionBadge";

export function AppHeader({ unreadCount, onOpenNotifications }: { unreadCount: number; onOpenNotifications: () => void }) {
  const { logout, token, user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("pawlife_theme");
    setDarkMode(saved !== "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
    localStorage.setItem("pawlife_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    // keep a single fetch in header for unread count correctness if parent forgets
    if (!token) return;
    api.getNotifications(token).catch(() => undefined);
  }, [token]);

  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          <PawPrint className="h-3.5 w-3.5" />
          Preventive Pet Health Intelligence
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">PawLife AI</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          AI assistant for early detection, emergency triage, and proactive pet healthcare decisions.
        </p>
        {user ? <p className="mt-1 text-xs text-slate-300">Signed in as {user.email}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <SubscriptionBadge />
        <button onClick={onOpenNotifications} className="relative rounded-lg border border-white/20 p-2 hover:bg-white/10" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px]">{unreadCount}</span>
          ) : null}
        </button>
        <button onClick={() => setDarkMode((v) => !v)} className="rounded-lg border border-white/20 p-2 hover:bg-white/10" aria-label="Toggle dark mode">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link href="/pricing" className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">
          Pricing
        </Link>
        <Link href="/settings" className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">
          Settings
        </Link>
        <button onClick={logout} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          Logout
        </button>
      </div>
    </header>
  );
}

