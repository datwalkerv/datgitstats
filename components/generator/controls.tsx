"use client";

import { RotateCcwIcon } from "lucide-react";
import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
  action,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground/70">{hint}</p> : null}
    </div>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="grid gap-0.5">
        <Label htmlFor={id} className="cursor-pointer text-[13px] font-normal text-foreground/90">
          {label}
        </Label>
        {description ? <span className="text-[11px] text-muted-foreground/70">{description}</span> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))} />
    </div>
  );
}

/** Slider paired with a numeric input. `0` can mean "auto" when `autoLabel` is set. */
export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  autoLabel,
  onValueChange,
  defaultValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  autoLabel?: string;
  defaultValue?: number;
  onValueChange: (v: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setDraft(String(value));
  }
  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() === "" && autoLabel) return onValueChange(0);
    if (Number.isFinite(n)) onValueChange(Math.min(max, Math.max(autoLabel ? 0 : min, n)));
    else setDraft(String(value));
  };
  const isAuto = autoLabel && value === 0;
  return (
    <Field
      label={label}
      htmlFor={id}
      action={
        defaultValue !== undefined && value !== defaultValue ? (
          <button
            type="button"
            onClick={() => onValueChange(defaultValue)}
            className="inline-flex items-center gap-1 rounded text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Reset ${label}`}
          >
            <RotateCcwIcon className="size-3" /> Reset
          </button>
        ) : null
      }
    >
      <div className="flex items-center gap-3">
        <Slider
          aria-label={label}
          value={isAuto ? min : value}
          min={min}
          max={max}
          step={step}
          onValueChange={(v) => onValueChange(Array.isArray(v) ? v[0] : (v as number))}
          className="flex-1"
        />
        <div className="relative">
          <input
            id={id}
            inputMode="decimal"
            value={isAuto ? "" : draft}
            placeholder={isAuto ? autoLabel : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
            }}
            className="h-7 w-16 rounded-md border border-input bg-input/30 pr-6 pl-2 text-right font-mono text-xs tabular-nums outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground/60">
            {unit}
          </span>
        </div>
      </div>
    </Field>
  );
}

export function SelectRow<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onValueChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <Select value={value} onValueChange={(v) => v && onValueChange(v as T)}>
        <SelectTrigger id={id} className="w-full" size="sm">
          <SelectValue>{(v: T) => options.find((o) => o.value === v)?.label ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Segmented control built on radio semantics. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onValueChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; icon?: React.ReactNode }[];
  onValueChange: (v: T) => void;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn("grid gap-2", className)}>
      <legend className="mb-2 text-xs font-medium text-muted-foreground">{label}</legend>
      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-all select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring hover:text-foreground",
              value === o.value && "bg-background text-foreground shadow-sm ring-1 ring-border",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onValueChange(o.value)}
              className="sr-only"
            />
            {o.icon}
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TextRow({
  label,
  value,
  placeholder,
  hint,
  onValueChange,
  maxLength,
}: {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  onValueChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-8 w-full rounded-md border border-input bg-input/30 px-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </Field>
  );
}

/** Toggle chips for multi-select lists (stat rows). */
export function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  selected: readonly T[];
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                on
                  ? "border-foreground/20 bg-foreground/[0.08] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/15 hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
