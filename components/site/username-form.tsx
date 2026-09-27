"use client";

import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { isValidUsername } from "@/lib/config";
import { cn } from "@/lib/utils";

interface Props {
  defaultValue?: string;
  size?: "lg" | "sm";
  /** Called instead of navigating when provided (used inside the generator). */
  onSubmit?: (username: string) => void;
  loading?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function UsernameForm({ defaultValue = "", size = "lg", onSubmit, loading, autoFocus, className }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const id = useId();
  const busy = loading || pending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = value.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//i, "").replace(/\/.*$/, "");
    if (!isValidUsername(u)) {
      setError("Enter a valid GitHub username.");
      return;
    }
    setError(null);
    setValue(u);
    if (onSubmit) onSubmit(u);
    else startTransition(() => router.push(`/generate?username=${encodeURIComponent(u)}`));
  }

  const lg = size === "lg";
  return (
    <form onSubmit={submit} className={cn("w-full", className)} noValidate>
      <label htmlFor={id} className="sr-only">
        GitHub username
      </label>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-xl border border-input bg-card/60 p-1 shadow-[0_1px_0_0_oklch(1_0_0/4%)_inset] transition-colors focus-within:border-ring/70 focus-within:ring-3 focus-within:ring-ring/20",
          error && "border-destructive/60",
        )}
      >
        <span
          aria-hidden
          className={cn("pl-3 font-mono text-muted-foreground/70 select-none", lg ? "text-sm" : "hidden text-xs sm:inline")}
        >
          github.com/
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="username"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent font-mono outline-none placeholder:text-muted-foreground/50",
            lg ? "h-10 text-sm" : "h-7 pl-2 text-sm sm:pl-0",
          )}
        />
        <Button type="submit" size={lg ? "lg" : "sm"} disabled={busy} className={cn(lg && "h-10 px-4")}>
          {busy ? <Loader2Icon className="animate-spin" /> : null}
          Generate
          {!busy && lg ? <ArrowRightIcon /> : null}
        </Button>
      </div>
      <p id={`${id}-err`} role="alert" className={cn("mt-2 text-xs text-destructive", !error && "sr-only")}>
        {error}
      </p>
    </form>
  );
}
