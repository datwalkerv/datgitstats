import { UsernameForm } from "@/components/site/username-form";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[480px] max-w-3xl rounded-full bg-[radial-gradient(closest-side,oklch(1_0_0/7%),transparent)] blur-2xl"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
          Stats, languages & streaks in one place
        </p>
        <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
          GitHub stats,
          <br />
          <span className="text-muted-foreground">your way.</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Generate beautiful, customizable GitHub stats cards for your README. Live preview, 25+ themes, one URL.
        </p>
        <UsernameForm className="mt-10 max-w-md" autoFocus={false} />
        <p className="mt-4 text-xs text-muted-foreground/70">No sign-up. Cards are plain SVG and work anywhere Markdown does.</p>
      </div>
    </section>
  );
}
