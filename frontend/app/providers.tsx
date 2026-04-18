"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/lib/auth";

function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
}

function useTheme() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("pawlife_theme");
    if (saved === "light") setDarkMode(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
    localStorage.setItem("pawlife_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return { darkMode, setDarkMode };
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  useServiceWorker();
  const theme = useTheme();

  return (
    <AuthProvider>
      {/* Theme is global via html class; expose setter later via context if needed */}
      <div data-theme={theme.darkMode ? "dark" : "light"}>{children}</div>
    </AuthProvider>
  );
}

