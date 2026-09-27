/* eslint-disable @next/next/no-img-element */
import { CodeBlock } from "@/components/generator/code-block";
import { siteUrl } from "@/lib/site";
import { SectionHeading } from "./section-heading";

export function ReadmeExample() {
  const origin = siteUrl();
  const code = `<p align="center">
  <img src="${origin}/api/stats?username=YOUR_NAME&amp;theme=tokyo-night" />
  <img src="${origin}/api/top-langs?username=YOUR_NAME&amp;theme=tokyo-night&amp;layout=compact" />
  <img src="${origin}/api/streak?username=YOUR_NAME&amp;theme=tokyo-night" />
</p>`;
  return (
    <section aria-labelledby="readme-example-heading" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <SectionHeading
        id="readme-example-heading"
        eyebrow="README integration"
        title="Copy, paste, done."
        description="The generator gives you Markdown, HTML or a combined README section with all three cards and their settings."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-muted-foreground">README.md</p>
          <CodeBlock code={code} label="README example" className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-muted-foreground">Rendered</p>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-3 rounded-lg border border-border bg-[#0d1117] bg-dots p-5">
            <img src="/api/demo?card=stats&theme=tokyo-night&hide_rank=true&width=300" alt="Sample stats card" className="h-auto max-w-full" loading="lazy" />
            <img src="/api/demo?card=top-langs&theme=tokyo-night&layout=compact&width=300" alt="Sample top languages card" className="h-auto max-w-full" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
