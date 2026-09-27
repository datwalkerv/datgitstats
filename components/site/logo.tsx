import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)} fill="none">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" stroke="currentColor" strokeOpacity=".25" />
      <rect x="6" y="12" width="3" height="6" rx="1" fill="currentColor" fillOpacity=".45" />
      <rect x="10.5" y="8" width="3" height="10" rx="1" fill="currentColor" fillOpacity=".7" />
      <rect x="15" y="5" width="3" height="13" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <LogoMark />
      <span className={cn(compact && "sr-only sm:not-sr-only")}>datgitstats</span>
    </Link>
  );
}
