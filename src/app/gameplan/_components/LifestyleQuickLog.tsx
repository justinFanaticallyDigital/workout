"use client";

/**
 * R9 — inline 1-tap log control rendered inside LifestyleShell. Two
 * shapes:
 *   - numeric (sleep_duration, steps, etc.) → small input + Save
 *   - scale_1_5 / scale_0_10 → buttons row, single tap submits
 *
 * On success, calls onLogged with the saved row so the parent can
 * merge it into the chart's local state without a refetch.
 */

import { useState } from "react";
import type { LifestyleVariable } from "@/lib/goal-engine/lifestyle-variables";
import type { LifestyleLogLite } from "./types";
import { Archivo } from "./typography";

interface Props {
  variable: LifestyleVariable;
  /** Today's existing log row, if any — used to render the current value. */
  todaysLog: LifestyleLogLite | null;
  programId: string | null;
  onLogged?: (log: LifestyleLogLite) => void;
}

export function LifestyleQuickLog({ variable, todaysLog, programId, onLogged }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>(() => {
    if (variable.type === "numeric" || variable.type === "scale_1_5" || variable.type === "scale_0_10") {
      return todaysLog?.numValue != null ? String(todaysLog.numValue) : "";
    }
    return todaysLog?.textValue ?? "";
  });

  async function submit(numValue: number | null, textValue: string | null) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/lifestyle-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variableKey: variable.key,
          numValue,
          textValue,
          unit: variable.unit,
          source: "MANUAL",
          programId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { log } = (await res.json()) as { log: LifestyleLogLite };
      onLogged?.(log);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  if (variable.type === "scale_1_5") {
    const current = todaysLog?.numValue ?? null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
          Log today
        </Archivo>
        {[1, 2, 3, 4, 5].map((n) => (
          <ScaleBtn
            key={n}
            n={n}
            active={current === n}
            disabled={pending}
            onClick={() => submit(n, null)}
          />
        ))}
        {error && <Archivo size={9} color="rgb(var(--ft-legs))">{error}</Archivo>}
      </div>
    );
  }

  if (variable.type === "scale_0_10") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
          Pain (0–10)
        </Archivo>
        <NumericQuickInput
          value={draft}
          setValue={setDraft}
          unit=""
          min={0}
          max={10}
          step={1}
          disabled={pending}
          onSave={(v) => submit(v, null)}
        />
        {error && <Archivo size={9} color="rgb(var(--ft-legs))">{error}</Archivo>}
      </div>
    );
  }

  if (variable.type === "enum_gyr") {
    const current = todaysLog?.textValue?.toUpperCase() ?? null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
          Readiness
        </Archivo>
        {(["GREEN", "YELLOW", "RED"] as const).map((t) => (
          <EnumBtn
            key={t}
            label={t}
            active={current === t}
            disabled={pending}
            onClick={() => submit(null, t)}
          />
        ))}
        {error && <Archivo size={9} color="rgb(var(--ft-legs))">{error}</Archivo>}
      </div>
    );
  }

  // numeric (sleep_duration, steps, hydration, mobility_minutes, etc.)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
        Log today {variable.unit ? `(${variable.unit})` : ""}
      </Archivo>
      <NumericQuickInput
        value={draft}
        setValue={setDraft}
        unit={variable.unit ?? ""}
        min={0}
        step={variable.unit === "hours" ? 0.25 : 1}
        disabled={pending}
        onSave={(v) => submit(v, null)}
      />
      {error && <Archivo size={9} color="rgb(var(--ft-legs))">{error}</Archivo>}
    </div>
  );
}

function ScaleBtn({
  n,
  active,
  disabled,
  onClick,
}: {
  n: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Rate ${n} of 5`}
      style={{
        width: 28,
        height: 28,
        border: `1px solid ${active ? "rgb(var(--ft-accent))" : "rgb(var(--ft-border))"}`,
        background: active ? "rgb(var(--ft-accent) / 0.15)" : "transparent",
        color: active ? "rgb(var(--ft-accent))" : "rgb(var(--ft-text-secondary))",
        fontFamily: "var(--ft-font-data)",
        fontSize: 13,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {n}
    </button>
  );
}

function EnumBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: "GREEN" | "YELLOW" | "RED";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const color =
    label === "GREEN"
      ? "rgb(var(--ft-pull))"
      : label === "YELLOW"
      ? "rgb(var(--ft-core))"
      : "rgb(var(--ft-legs))";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "3px 9px",
        border: `1px solid ${active ? color : "rgb(var(--ft-border))"}`,
        background: active ? `${color}` : "transparent",
        color: active ? "rgb(var(--ft-bg))" : color,
        fontFamily: "var(--ft-font-body)",
        fontSize: 9,
        letterSpacing: ".14em",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

function NumericQuickInput({
  value,
  setValue,
  unit,
  min,
  max,
  step,
  disabled,
  onSave,
}: {
  value: string;
  setValue: (v: string) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  disabled: boolean;
  onSave: (n: number) => void;
}) {
  const parsed = Number(value);
  const valid = value !== "" && !Number.isNaN(parsed);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        style={{
          width: 64,
          padding: "3px 6px",
          border: "1px solid rgb(var(--ft-border))",
          background: "rgb(var(--ft-bg))",
          color: "rgb(var(--ft-text-primary))",
          fontFamily: "var(--ft-font-data)",
          fontSize: 12,
        }}
      />
      {unit && (
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
          {unit}
        </Archivo>
      )}
      <button
        type="button"
        disabled={!valid || disabled}
        onClick={() => valid && onSave(parsed)}
        style={{
          padding: "3px 10px",
          border: "1px solid rgb(var(--ft-accent))",
          background: valid && !disabled ? "rgb(var(--ft-accent))" : "transparent",
          color: valid && !disabled ? "rgb(var(--ft-bg))" : "rgb(var(--ft-accent))",
          fontFamily: "var(--ft-font-body)",
          fontSize: 9,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          cursor: valid && !disabled ? "pointer" : "default",
          opacity: valid && !disabled ? 1 : 0.55,
        }}
      >
        Save
      </button>
    </div>
  );
}
