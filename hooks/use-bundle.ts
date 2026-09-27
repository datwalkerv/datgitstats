"use client";

import { useEffect, useState } from "react";
import type { UserBundle } from "@/types/github";

export type BundleState =
  | { status: "idle" }
  | { status: "loading"; username: string }
  | { status: "ready"; username: string; bundle: UserBundle }
  | { status: "error"; username: string; title: string; message: string; code?: string };

type Settled = Extract<BundleState, { status: "ready" | "error" }>;

const cache = new Map<string, Promise<UserBundle>>();

async function load(username: string): Promise<UserBundle> {
  const res = await fetch(`/api/data?username=${encodeURIComponent(username)}`);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.error) {
    const err = body?.error ?? {};
    throw Object.assign(new Error(err.message ?? "Unable to load GitHub data"), {
      title: err.title ?? "Unable to load GitHub data",
      code: err.code,
    });
  }
  return body as UserBundle;
}

/** Loads (and memoises per session) the data bundle for a username. */
export function useBundle(username: string | null): BundleState {
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    const key = username.toLowerCase();
    let p = cache.get(key);
    if (!p) {
      p = load(username);
      cache.set(key, p);
    }
    p.then(
      (bundle) => !cancelled && setSettled({ status: "ready", username, bundle }),
      (e: Error & { title?: string; code?: string }) => {
        cache.delete(key);
        if (!cancelled)
          setSettled({ status: "error", username, title: e.title ?? "Error", message: e.message, code: e.code });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!username) return { status: "idle" };
  if (settled?.username !== username) return { status: "loading", username };
  return settled;
}
