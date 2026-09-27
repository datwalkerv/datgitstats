import { z } from "zod";

/**
 * A single URL-serializable option. Every field parses from a raw query value
 * (string | undefined), falls back to its default on invalid input (a README
 * image must never break because of a typo), and knows how to encode itself.
 */
export interface Field<T> {
  kind: "bool" | "int" | "float" | "enum" | "color" | "text" | "list" | "colors";
  default: T;
  doc: string;
  parse: (raw: string | undefined) => T;
  encode: (value: T) => string | undefined;
  options?: readonly string[];
  min?: number;
  max?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldMap = Record<string, Field<any>>;
export type ValuesOf<F> = { [K in keyof F]: F[K] extends Field<infer T> ? T : never };

const HEX = /^[0-9a-fA-F]{3,8}$/;

function withCatch<T>(schema: z.ZodType<T>, def: T) {
  return (raw: string | undefined): T => {
    if (raw === undefined || raw === "") return def;
    const r = schema.safeParse(raw);
    return r.success ? r.data : def;
  };
}

export function bool(def: boolean, doc: string): Field<boolean> {
  const schema = z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.enum(["true", "false", "1", "0", "yes", "no"]))
    .transform((s) => s === "true" || s === "1" || s === "yes");
  return { kind: "bool", default: def, doc, parse: withCatch(schema, def), encode: (v) => String(v) };
}

export function int(def: number, min: number, max: number, doc: string): Field<number> {
  const schema = z.coerce.number().int().transform((n) => Math.min(max, Math.max(min, n)));
  return { kind: "int", default: def, doc, min, max, parse: withCatch(schema, def), encode: (v) => String(v) };
}

export function float(def: number, min: number, max: number, doc: string): Field<number> {
  const schema = z.coerce.number().finite().transform((n) => Math.min(max, Math.max(min, n)));
  return {
    kind: "float", default: def, doc, min, max,
    parse: withCatch(schema, def),
    encode: (v) => String(Math.round(v * 100) / 100),
  };
}

export function enumOf<const O extends readonly [string, ...string[]]>(
  options: O,
  def: O[number],
  doc: string,
): Field<O[number]> {
  const schema = z.string().transform((s) => s.trim().toLowerCase()).pipe(z.enum(options));
  return {
    kind: "enum", default: def, doc, options,
    parse: withCatch(schema as z.ZodType<O[number]>, def),
    encode: (v) => v,
  };
}

/** Hex color without "#" (the "#" is accepted and stripped). Stored normalised with "#". */
export function color(doc: string): Field<string | undefined> {
  const schema = z
    .string()
    .transform((s) => s.trim().replace(/^#/, ""))
    .refine((s) => HEX.test(s))
    .transform((s) => "#" + s.toLowerCase());
  return {
    kind: "color", default: undefined, doc,
    parse: withCatch(schema as z.ZodType<string | undefined>, undefined),
    encode: (v) => v?.replace(/^#/, ""),
  };
}

/** Comma separated hex colors (for contribution levels). */
export function colors(count: number, doc: string): Field<string[] | undefined> {
  const schema = z
    .string()
    .transform((s) => s.split(",").map((c) => c.trim().replace(/^#/, "")))
    .refine((arr) => arr.length === count && arr.every((c) => HEX.test(c)))
    .transform((arr) => arr.map((c) => "#" + c.toLowerCase()));
  return {
    kind: "colors", default: undefined, doc,
    parse: withCatch(schema as z.ZodType<string[] | undefined>, undefined),
    encode: (v) => v?.map((c) => c.replace(/^#/, "")).join(","),
  };
}

export function text(maxLength: number, doc: string): Field<string | undefined> {
  const schema = z.string().transform((s) => s.trim().slice(0, maxLength)).refine((s) => s.length > 0);
  return {
    kind: "text", default: undefined, doc,
    parse: withCatch(schema as z.ZodType<string | undefined>, undefined),
    encode: (v) => v,
  };
}

/** Comma separated, lower-cased, de-duplicated list. */
export function list(doc: string, maxItems = 50): Field<string[]> {
  const schema = z.string().transform((s) =>
    Array.from(
      new Set(
        s
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean)
          .map((x) => x.slice(0, 100)),
      ),
    ).slice(0, maxItems),
  );
  return {
    kind: "list", default: [], doc,
    parse: withCatch(schema, []),
    encode: (v) => (v.length ? v.join(",") : undefined),
  };
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const v = source[key];
  return Array.isArray(v) ? v[0] : v;
}

export function parseFields<F extends FieldMap>(fields: F, source: ParamSource): ValuesOf<F> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(fields)) out[key] = fields[key].parse(read(source, key));
  return out as ValuesOf<F>;
}

function isDefault(field: Field<unknown>, value: unknown) {
  if (Array.isArray(value) && Array.isArray(field.default)) {
    return value.length === field.default.length && value.every((v, i) => v === (field.default as unknown[])[i]);
  }
  return value === field.default;
}

/** Writes only non-default values, in field declaration order, for short stable URLs. */
export function encodeFields<F extends FieldMap>(
  fields: F,
  values: Partial<ValuesOf<F>>,
  into: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  for (const key of Object.keys(fields)) {
    const value = (values as Record<string, unknown>)[key];
    if (value === undefined || isDefault(fields[key], value)) continue;
    const encoded = fields[key].encode(value);
    if (encoded !== undefined && encoded !== "") into.set(key, encoded);
  }
  return into;
}

export function defaultsOf<F extends FieldMap>(fields: F): ValuesOf<F> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(fields)) {
    const d = fields[key].default;
    out[key] = Array.isArray(d) ? [...d] : d;
  }
  return out as ValuesOf<F>;
}
