"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ColorKey } from "@/lib/generator-state";

export interface CustomTheme {
  id: string;
  name: string;
  base: string;
  colors: Partial<Record<ColorKey, string>>;
  contrib?: string[];
}

const KEY = "datgitstats:custom-themes";
const listeners = new Set<() => void>();
let snapshot: CustomTheme[] | null = null;
const EMPTY: CustomTheme[] = [];

function read(): CustomTheme[] {
  if (snapshot) return snapshot;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CustomTheme[]) : [];
    snapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(themes: CustomTheme[]) {
  snapshot = themes;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(themes));
  } catch {
    // Storage unavailable (private mode): keep themes for this session only.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Custom themes persisted in localStorage (per browser). */
export function useCustomThemes() {
  const themes = useSyncExternalStore(subscribe, read, () => EMPTY);
  const save = useCallback((t: Omit<CustomTheme, "id">) => {
    const id = `custom-${Date.now().toString(36)}`;
    write([...read(), { ...t, id }]);
    return id;
  }, []);
  const remove = useCallback((id: string) => write(read().filter((t) => t.id !== id)), []);
  return { themes, save, remove };
}
