"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextValue = {
  supabase: SupabaseClient | null;
  user: any | null;
  session: any | null;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

export function useSupabase() {
  const ctx = useContext(SupabaseContext);

  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");

  return ctx;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    ),
  );

  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      // sync session to server to persist HttpOnly cookie for SSR
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: data.session ?? null }),
        });
      } catch {
        // ignore
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
        // sync session changes to server
        fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: session ?? null }),
        }).catch(() => {});
      },
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    // clear server cookie
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // ignore
    }
  }

  async function signInWithOAuth(provider: string) {
    try {
      await supabase.auth.signInWithOAuth({ provider: provider as any });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("signInWithOAuth error", err);
    }
  }

  async function signInWithEmail(email: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("signInWithEmail error", error);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("signInWithEmail unexpected error", err);
    }
  }

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        session,
        signOut,
        signInWithOAuth,
        signInWithEmail,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
