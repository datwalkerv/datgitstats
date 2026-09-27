import Link from "next/link";
import { GithubIcon } from "@/components/site/icons";
import { Logo } from "@/components/site/logo";

const NAV = [
  { href: "/generate", label: "Generator" },
  { href: "/#themes", label: "Themes" },
  { href: "/#api", label: "API" },
  { href: "/#faq", label: "FAQ" },
];

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hidden rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/generate"
            className="inline-flex rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
          >
            Generator
          </Link>
          {REPO_URL ? (
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="ml-1 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <GithubIcon className="size-4" />
          </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
