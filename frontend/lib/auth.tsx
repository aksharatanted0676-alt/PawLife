"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { User } from "./types";

type AuthContextValue = {
  token: string;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  refreshUser: () => Promise<User | null>;
  login: (payload: { email: string; password: string }) => Promise<{ token: string; user: User }>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<{ token: string; user: User }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "pawlife_token";
const USER_KEY = "pawlife_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const setSession = useCallback(
    (nextToken: string, nextUser: User) => {
      persist(nextToken, nextUser);
    },
    [persist]
  );

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const res = await api.login(payload);
      persist(res.token, res.user);
      return res;
    },
    [persist, router]
  );

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      const res = await api.signup(payload);
      persist(res.token, res.user);
      return res;
    },
    [persist, router]
  );

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await api.getMe(token);
      persist(token, res.user);
      return res.user;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken("");
      setUser(null);
      return null;
    }
  }, [token, persist]);

  useEffect(() => {
    if (!hydrated || !token) return;
    refreshUser();
  }, [hydrated, token, refreshUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, hydrated, setSession, refreshUser, login, signup, logout }),
    [token, user, hydrated, setSession, refreshUser, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

