"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({
  value,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  className,
  variant = "ghost",
  showLabel = false,
}: {
  value: string;
  label?: string;
  toastMessage?: string;
  className?: string;
  variant?: "ghost" | "secondary" | "outline" | "default";
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size={showLabel ? "sm" : "icon-sm"}
      variant={variant}
      aria-label={showLabel ? undefined : label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={async () => {
        if (await copyText(value)) {
          setCopied(true);
          toast.success(toastMessage);
          setTimeout(() => setCopied(false), 1400);
        } else toast.error("Couldn't copy — select the text manually.");
      }}
    >
      <span className="relative inline-flex size-3.5">
        <CopyIcon className={cn("absolute inset-0 size-3.5 transition-all", copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} />
        <CheckIcon className={cn("absolute inset-0 size-3.5 text-emerald-400 transition-all", copied ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
      </span>
      {showLabel ? <span>{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}
