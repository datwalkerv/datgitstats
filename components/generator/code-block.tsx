import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export function CodeBlock({ code, label, className }: { code: string; label: string; className?: string }) {
  return (
    <div className={cn("group relative min-w-0 rounded-lg border border-border bg-black/30", className)}>
      <pre
        aria-label={label}
        tabIndex={0}
        className="scrollbar-thin max-h-64 overflow-auto p-3 pr-11 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-foreground/85 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <code>{code}</code>
      </pre>
      <CopyButton value={code} label={`Copy ${label}`} className="absolute top-1.5 right-1.5" />
    </div>
  );
}
