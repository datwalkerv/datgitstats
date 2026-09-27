import { LogoMark } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <LogoMark className="size-4" />
          <span>datgitstats</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Open source, self-hostable README cards.</span>
        </div>
        <p className="text-muted-foreground/70">Not affiliated with GitHub, Inc.</p>
      </div>
    </footer>
  );
}
