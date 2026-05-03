"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { fmtWeight } from "./util";

interface SetSheetProps {
  /** Lane context shown in the header. */
  exerciseName: string;
  setIdx: number;
  category?: string | null;
  targetReps?: string | null;
  targetRpe?: string | null;
  /** Pre-fill from current set if editing, else from last-week ghost. */
  initial: { weight: number | null; reps: number | null; rir: number | null };
  /** Last-week's same set, used for the "MATCH LAST" affordance. */
  lastWeek?: { weight: number | null; reps: number | null } | null;
  onCommit: (values: { weight: number; reps: number; rir: number | null }) => void;
  onCancel: () => void;
}

type Field = "weight" | "reps" | "rpe";

/**
 * Bottom sheet for entering / editing a single set's values. Ports
 * `SetSheet` from logger-app.jsx (lines 706–856).
 *
 * Three big tappable fields (WEIGHT / REPS / RPE) up top — taps focus
 * one and the keypad below routes digit input there. Quick adjustment
 * buttons (-5, +2.5, +5, +10) appear when WEIGHT is focused. A
 * "MATCH LAST" pill copies last-week's weight + reps if available.
 *
 * Per-chrome attestations (logger-app.jsx#754-851):
 *   lab       → 16px top-radius (rounded sheet), tracked caps actions
 *   notebook  → 8px top-radius, paper-feel
 *   arcade    → 0 radius, FINISH btn text-color = #000 on neon pink
 *   iron      → 0 radius, accent-bordered LOG SET btn
 *   blueprint → 0 radius, R0-token fallback
 *   cyberpunk → 0 radius, R0-token fallback
 *   graffiti  → 0 radius, R0-token fallback
 *
 * Note on the RPE/RIR mapping:
 *   The schema stores both `rir` (reps-in-reserve) and `rpe` columns
 *   on Set. The prototype talks about RPE. We collect RPE from the
 *   user (more common framing) and store it as `rir = 10 - rpe` —
 *   matches the existing `/api/sets` payload contract. R3 stays
 *   UI-only and does not start writing the `rpe` column directly.
 */
export default function SetSheet({
  exerciseName,
  setIdx,
  category,
  targetReps,
  targetRpe,
  initial,
  lastWeek,
  onCommit,
  onCancel,
}: SetSheetProps) {
  const { chrome } = useTheme();
  const isArcade = chrome === "arcade";
  const isLab = chrome === "lab";
  const isNotebook = chrome === "notebook";
  const topRadius = isLab ? 16 : isNotebook ? 8 : 0;
  const btnRadius = isLab ? 6 : isNotebook ? 4 : 0;

  // Pre-fill: prefer initial values, fall back to last-week ghost, else sensible defaults.
  const [weight, setWeight] = useState<number>(
    initial.weight ?? lastWeek?.weight ?? 0,
  );
  const [reps, setReps] = useState<number>(
    initial.reps ?? lastWeek?.reps ?? parseTargetReps(targetReps) ?? 8,
  );
  const initialRpe =
    initial.rir != null ? 10 - initial.rir : parseTargetRpe(targetRpe) ?? 8;
  const [rpe, setRpe] = useState<number>(initialRpe);
  const [focus, setFocus] = useState<Field>(
    initial.weight == null ? "weight" : "reps",
  );

  /** Close on Escape for desktop. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const get = (f: Field): number =>
    f === "weight" ? weight : f === "reps" ? reps : rpe;
  const set = (f: Field, v: number) => {
    if (f === "weight") setWeight(v);
    else if (f === "reps") setReps(v);
    else setRpe(Math.max(0, Math.min(10, v)));
  };

  const onPad = (k: string) => {
    if (k === "clear") return set(focus, 0);
    if (k === "back") {
      if (focus === "rpe") return set("rpe", 0);
      return set(focus, Math.floor(get(focus) / 10));
    }
    const cur = get(focus);
    if (focus === "rpe") {
      const digit = Number(k);
      if (cur === 1 && digit === 0) return set("rpe", 10);
      if (digit === 0) return;
      return set("rpe", digit);
    }
    set(focus, cur * 10 + Number(k));
  };

  const matchLast = () => {
    if (!lastWeek?.weight) return;
    setWeight(lastWeek.weight);
    if (lastWeek.reps != null) setReps(lastWeek.reps);
  };

  const commit = () => {
    onCommit({
      weight,
      reps,
      rir: rpe === 0 ? null : 10 - rpe,
    });
  };

  return (
    <>
      <div
        onClick={onCancel}
        className="fixed inset-0 z-[90]"
        style={{ background: "rgb(0 0 0 / 0.5)" }}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label={`Log set ${setIdx + 1} for ${exerciseName}`}
        className="fixed bottom-0 left-0 right-0 z-[91] max-w-2xl mx-auto"
        style={{
          background: "rgb(var(--ft-surface))",
          borderTop: "1px solid rgb(var(--ft-border))",
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRadius,
          padding: "10px 14px 16px",
          boxShadow: "0 -20px 40px rgb(0 0 0 / 0.3)",
        }}
      >
        {/* grabber */}
        <div
          aria-hidden
          style={{
            width: 36,
            height: 4,
            background: "rgb(var(--ft-text-tertiary) / 0.4)",
            borderRadius: 2,
            margin: "0 auto 10px",
          }}
        />

        {/* context row */}
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <div className="min-w-0">
            <div
              className="font-data"
              style={{
                fontSize: 10,
                color: "rgb(var(--ft-text-tertiary))",
                letterSpacing: ".15em",
                textTransform: "uppercase",
              }}
            >
              {category ? `${category.toUpperCase()} · ` : ""}SET {setIdx + 1}
            </div>
            <div
              className="font-display truncate mt-0.5"
              style={{
                fontSize: 14,
                color: "rgb(var(--ft-text-primary))",
              }}
            >
              {exerciseName}
            </div>
          </div>
          {lastWeek?.weight != null && (
            <button
              onClick={matchLast}
              className="shrink-0 text-left"
              style={{
                background: "rgb(var(--ft-bg-alt))",
                border: "1px solid rgb(var(--ft-border) / 0.6)",
                borderRadius: btnRadius,
                padding: "6px 10px",
              }}
            >
              <div
                className="font-data"
                style={{
                  fontSize: 9,
                  letterSpacing: ".12em",
                  color: "rgb(var(--ft-text-tertiary))",
                  textTransform: "uppercase",
                }}
              >
                LAST
              </div>
              <div
                className="font-data tabular-nums"
                style={{
                  fontSize: 13,
                  color: "rgb(var(--ft-text-primary))",
                  fontWeight: 600,
                }}
              >
                {fmtWeight(lastWeek.weight)}×{lastWeek.reps}
              </div>
            </button>
          )}
        </div>

        {/* fields */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          <FieldButton
            label="WEIGHT"
            value={weight}
            unit="lb"
            active={focus === "weight"}
            onClick={() => setFocus("weight")}
            radius={btnRadius}
          />
          <FieldButton
            label="REPS"
            value={reps}
            unit={targetReps ? `target ${targetReps}` : ""}
            active={focus === "reps"}
            onClick={() => setFocus("reps")}
            radius={btnRadius}
          />
          <FieldButton
            label="RPE"
            value={rpe}
            unit={targetRpe ? `target @${targetRpe}` : "1–10"}
            active={focus === "rpe"}
            onClick={() => setFocus("rpe")}
            radius={btnRadius}
          />
        </div>

        {/* quick weight adjusters */}
        {focus === "weight" && (
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <QuickBtn radius={btnRadius} onClick={() => setWeight(Math.max(0, weight - 5))}>
              − 5
            </QuickBtn>
            <QuickBtn radius={btnRadius} onClick={() => setWeight(weight + 2.5)}>
              + 2.5
            </QuickBtn>
            <QuickBtn radius={btnRadius} onClick={() => setWeight(weight + 5)}>
              + 5
            </QuickBtn>
            <QuickBtn radius={btnRadius} onClick={() => setWeight(weight + 10)}>
              + 10
            </QuickBtn>
          </div>
        )}

        {/* keypad */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const).map(
            (k) => (
              <PadKey key={k} k={k} radius={btnRadius} onClick={() => onPad(k)} />
            ),
          )}
        </div>

        {/* actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onCancel}
            className="font-body flex-1 py-3"
            style={{
              background: "transparent",
              border: "1px solid rgb(var(--ft-border) / 0.6)",
              borderRadius: btnRadius,
              color: "rgb(var(--ft-text-secondary))",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            Cancel
          </button>
          <button
            onClick={commit}
            className="font-body py-3"
            style={{
              flex: 2,
              background: "rgb(var(--ft-accent))",
              border: "1px solid rgb(var(--ft-accent))",
              borderRadius: btnRadius,
              color: isArcade ? "rgb(var(--ft-bg))" : "rgb(var(--ft-text-on-accent))",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            Log set
          </button>
        </div>
      </div>
    </>
  );
}

function FieldButton({
  label,
  value,
  unit,
  active,
  onClick,
  radius,
}: {
  label: string;
  value: number;
  unit: string;
  active: boolean;
  onClick: () => void;
  radius: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 10px",
        textAlign: "center",
        background: active
          ? "rgb(var(--ft-accent) / 0.15)"
          : "rgb(var(--ft-bg-alt))",
        border: `1px solid ${
          active ? "rgb(var(--ft-accent))" : "rgb(var(--ft-border) / 0.4)"
        }`,
        borderRadius: radius,
        cursor: "pointer",
      }}
    >
      <div
        className="font-data"
        style={{
          fontSize: 9,
          color: "rgb(var(--ft-text-tertiary))",
          letterSpacing: ".12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        className="font-data tabular-nums"
        style={{
          fontSize: 26,
          color: "rgb(var(--ft-text-primary))",
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      {unit && (
        <div
          className="font-data truncate"
          style={{
            fontSize: 9,
            color: "rgb(var(--ft-text-tertiary))",
          }}
        >
          {unit}
        </div>
      )}
    </button>
  );
}

function QuickBtn({
  children,
  onClick,
  radius,
}: {
  children: React.ReactNode;
  onClick: () => void;
  radius: number;
}) {
  return (
    <button
      onClick={onClick}
      className="font-body"
      style={{
        padding: "8px 0",
        background: "rgb(var(--ft-bg-alt))",
        border: "1px solid rgb(var(--ft-border) / 0.6)",
        borderRadius: radius,
        color: "rgb(var(--ft-text-secondary))",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PadKey({
  k,
  onClick,
  radius,
}: {
  k: string;
  onClick: () => void;
  radius: number;
}) {
  const isAction = k === "clear" || k === "back";
  return (
    <button
      onClick={onClick}
      className="font-body tabular-nums"
      style={{
        padding: "14px 0",
        background: isAction ? "rgb(var(--ft-bg-alt))" : "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border) / 0.4)",
        borderRadius: radius,
        color: "rgb(var(--ft-text-primary))",
        fontSize: 20,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {k === "back" ? "⌫" : k === "clear" ? "C" : k}
    </button>
  );
}

function parseTargetReps(target: string | null | undefined): number | null {
  if (!target) return null;
  const first = parseInt(target.split("-")[0], 10);
  return Number.isFinite(first) ? first : null;
}

function parseTargetRpe(target: string | null | undefined): number | null {
  if (!target) return null;
  const first = parseFloat(target.split("-")[0]);
  return Number.isFinite(first) ? first : null;
}
