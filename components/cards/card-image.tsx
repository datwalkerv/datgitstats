/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/** Renders a generated SVG string through <img>, exactly like GitHub does in a README. */
export function CardImage({ src, alt, className, width, height }: { src: string; alt: string; className?: string; width?: number; height?: number }) {
  return <img src={src} alt={alt} width={width} height={height} className={cn("block h-auto max-w-full", className)} draggable={false} />;
}

export function svgSize(svg: string): { width: number; height: number } {
  const m = /<svg[^>]*\swidth="(\d+)"\s+height="(\d+)"/.exec(svg);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 400, height: 200 };
}
