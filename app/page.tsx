import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { ApiDocs } from "@/components/home/api-docs";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { LiveExamples } from "@/components/home/live-examples";
import { ReadmeExample } from "@/components/home/readme-example";
import { ThemeShowcase } from "@/components/home/theme-showcase";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col gap-28 pb-28 sm:gap-36">
        <div className="flex flex-col">
          <Hero />
          <LiveExamples />
        </div>
        <ThemeShowcase />
        <Features />
        <ReadmeExample />
        <ApiDocs />
        <Faq />
        <section className="mx-auto w-full flex max-w-3xl flex-col items-center px-4 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em]">Make your profile yours.</h2>
          <p className="mt-3 text-muted-foreground">It takes about a minute.</p>
          <Link
            href="/generate"
            className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            Open the generator <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
