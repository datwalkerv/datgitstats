export function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description?: string; id?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">{eyebrow}</p>
      <h2 id={id} className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-balance leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}
