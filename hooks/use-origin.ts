"use client";

import { useSyncExternalStore } from "react";
import { siteUrl } from "@/lib/site";

const subscribe = () => () => {};

/** The public origin for generated URLs: NEXT_PUBLIC_SITE_URL if set, otherwise the current origin. */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin,
    () => siteUrl(),
  );
}
