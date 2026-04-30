"use client";

import type { CustomizationInput } from "@/lib/program-templates/types";

type AnswerValue = string | number | boolean | string[] | null | undefined;

interface RendererProps {
  input: CustomizationInput;
  value: AnswerValue;
  onChange: (next: AnswerValue) => void;
  error?: string | null;
}

// ============================================================
// Top-level dispatcher
// ============================================================
export function CustomizationInputRenderer(props: RendererProps) {
  const { input } = props;
  switch (input.type) {
    case "select":
      return <SelectRenderer {...props} />;
    case "multi_select":
      return <MultiSelectRenderer {...props} />;
    case "number":
      return <NumberRenderer {...props} />;
    case "text":
      return <TextRenderer {...props} />;
    case "boolean":
      return <BooleanRenderer {...props} />;
    case "date":
      return <DateRenderer {...props} />;
    default:
      return null;
  }
}

// ============================================================
// select — vertical button list
// ============================================================
function SelectRenderer({ input, value, onChange }: RendererProps) {
  const options = input.options ?? [];
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = String(value ?? "") === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={[
              "w-full text-left px-4 py-3 border-2 transition-colors",
              "rounded-[var(--ft-border-radius,0)]",
              selected
                ? "border-ft-accent bg-ft-accent/10 text-ft-white"
                : "border-ft-border bg-ft-surface text-ft-light hover:border-ft-light",
            ].join(" ")}
          >
            <span className="font-body text-base">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// multi_select — wrapped chip toggles
// ============================================================
function MultiSelectRenderer({ input, value, onChange }: RendererProps) {
  const options = input.options ?? [];
  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter((s) => s !== v));
    } else {
      onChange([...selected, v]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isOn = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            aria-pressed={isOn}
            className={[
              "px-3 py-2 border-2 transition-colors text-sm font-body",
              "rounded-[var(--ft-border-radius,0)]",
              isOn
                ? "border-ft-accent bg-ft-accent/15 text-ft-white"
                : "border-ft-border bg-ft-surface text-ft-light hover:border-ft-light",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// number — big centered input with steppers
// ============================================================
function NumberRenderer({ input, value, onChange }: RendererProps) {
  const numValue = typeof value === "number" ? value : 0;
  const step = 1;

  const setVal = (n: number) => {
    if (Number.isNaN(n)) {
      onChange(null);
      return;
    }
    onChange(n);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setVal((numValue || 0) - step)}
        className="w-12 h-12 border-2 border-ft-border bg-ft-surface text-ft-white text-2xl font-display rounded-[var(--ft-border-radius,0)] hover:border-ft-accent"
        aria-label="Decrement"
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value === null || value === undefined || value === "" ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
          } else {
            const n = Number(raw);
            onChange(Number.isFinite(n) ? n : null);
          }
        }}
        className={[
          "w-32 h-16 text-center text-3xl font-handwritten",
          "bg-ft-surface border-2 border-ft-border text-ft-white",
          "rounded-[var(--ft-border-radius,0)]",
          "focus:border-ft-accent focus:outline-none",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        ].join(" ")}
        placeholder="0"
      />
      <button
        type="button"
        onClick={() => setVal((numValue || 0) + step)}
        className="w-12 h-12 border-2 border-ft-border bg-ft-surface text-ft-white text-2xl font-display rounded-[var(--ft-border-radius,0)] hover:border-ft-accent"
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}

// ============================================================
// text — single-line input
// ============================================================
function TextRenderer({ input, value, onChange }: RendererProps) {
  return (
    <input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={input.label}
      className={[
        "w-full h-12 px-4 text-base font-body",
        "bg-ft-surface border-2 border-ft-border text-ft-white",
        "rounded-[var(--ft-border-radius,0)]",
        "focus:border-ft-accent focus:outline-none",
        "placeholder:text-ft-muted",
      ].join(" ")}
    />
  );
}

// ============================================================
// boolean — labeled toggle
// ============================================================
function BooleanRenderer({ input, value, onChange }: RendererProps) {
  const on = value === true;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        "flex items-center justify-between w-full px-4 py-3",
        "bg-ft-surface border-2 transition-colors",
        "rounded-[var(--ft-border-radius,0)]",
        on ? "border-ft-accent" : "border-ft-border",
      ].join(" ")}
    >
      <span className="font-body text-base text-ft-white">
        {on ? "Yes" : "No"}
      </span>
      <span
        className={[
          "relative w-12 h-6 rounded-full transition-colors",
          on ? "bg-ft-accent" : "bg-ft-border",
        ].join(" ")}
        aria-hidden
      >
        <span
          className={[
            "absolute top-0.5 w-5 h-5 rounded-full bg-ft-white transition-all",
            on ? "left-[26px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

// ============================================================
// date — native picker, themed shell
// ============================================================
function DateRenderer({ value, onChange }: RendererProps) {
  return (
    <input
      type="date"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={[
        "w-full h-12 px-4 text-base font-body",
        "bg-ft-surface border-2 border-ft-border text-ft-white",
        "rounded-[var(--ft-border-radius,0)]",
        "focus:border-ft-accent focus:outline-none",
      ].join(" ")}
    />
  );
}

// ============================================================
// Validation helper — used by the parent step container
// ============================================================
export function validateAnswer(
  input: CustomizationInput,
  value: AnswerValue,
): string | null {
  if (!input.required) return null;

  if (input.type === "multi_select") {
    if (!Array.isArray(value) || value.length === 0) {
      return "Pick at least one option";
    }
    return null;
  }

  if (input.type === "boolean") {
    // Required boolean = must be set (true OR false). Treat null/undefined as missing.
    if (value === null || value === undefined) return "Required";
    return null;
  }

  if (input.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) return "Enter a number";
    return null;
  }

  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return "Required";
  }

  return null;
}
