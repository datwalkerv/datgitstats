import type { CommonOptions } from "@/lib/config";
import { defaultCardOptions } from "@/lib/config";
import { escapeXml, frame, makeCtx, truncate } from "./primitives";

export interface ErrorCardInput {
  title: string;
  message: string;
  /** Card title shown above the error (e.g. "GitHub Stats"). */
  card?: string;
  options?: Partial<CommonOptions>;
}

/** Always-valid SVG so README images never render as broken. */
export function renderErrorCard({ title, message, card, options }: ErrorCardInput): string {
  const o = { ...defaultCardOptions("stats"), ...options, hide_title: false, custom_title: undefined, width: 0, height: 0 };
  const ctx = makeCtx(o);
  const w = Math.max(360, options?.width || 0);
  const h = 130;
  const { pad, fs, theme } = ctx;
  const y = pad + fs * 1.3 + 22;
  const body = `
<g class="fade">
  <circle cx="${pad + 7}" cy="${y - 5}" r="7" fill="none" stroke="${theme.accent}" stroke-width="1.5"/>
  <path d="M${pad + 7} ${y - 9}v5" stroke="${theme.accent}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="${pad + 7}" cy="${y - 1.2}" r=".9" fill="${theme.accent}"/>
  <text class="value" x="${pad + 24}" y="${y}">${escapeXml(truncate(ctx, title, w - pad * 2 - 24, fs, true))}</text>
  <text class="muted" x="${pad}" y="${y + 26}">${escapeXml(truncate(ctx, message, w - pad * 2, fs * 0.86))}</text>
</g>`;
  return frame({ ctx, width: w, height: h, title: card ?? "GitHub Card", desc: `${title}. ${message}`, body });
}
