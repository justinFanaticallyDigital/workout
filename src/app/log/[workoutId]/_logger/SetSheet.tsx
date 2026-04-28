"use client";

import { useEffect, useState } from "react";

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
 * Bottom sheet for entering / editing a single set's values.
 *
 * Three big tappable fields (WEIGHT / REPS / RPE) up top — taps focus
 * one and the keypad below routes digit input there. Quick adjustment
 * buttons (-5, +2.5, +5, +10) appear when WEIGHT is focused. A
 * "MATCH LAST" pill copies last-week's weight + reps if available.
 *
 * Note on the RPE/RIR mapping:
 *   The schema stores RIR (reps-in-reserve). The prototype talks about
 *   RPE. We collect RPE from the user (more common framing) and store
 *   it as `rir = 10 - rpe`. RPE 10 = RIR 0, RPE 7 = RIR 3, etc.
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
  // Pre-fill: prefer initial values, fall back to last-week ghost, else sensible defaults.
  const [weight, setWeight] = useState<number>(
    initial.weight ?? lastWeek?.weight ?? 0,
  );
  const [reps, setReps] = useState<number>(
    initial.reps ?? lastWeek?.reps ?? parseTargetReps(targetReps) ?? 8,
  );
  const initialRpe = initial.rir != null ? 10 - initial.rir : parseTargetRpe(targetRpe) ?? 8;
  const [rpe, setRpe] = useState<number>(initialRpe);
  const [focus, setFocus] = useState<Field>(initial.weight == null ? "weight" : "reps");

  /** Close on Escape for desktop. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const get = (f: Field): number => (f === "weight" ? weight : f === "reps" ? reps : rpe);
  const set = (f: Field, v: number) => {
    if (f === "weight") setWeight(v);
    else if (f === "reps") setReps(v);
    else setRpe(Math.max(1, Math.min(10, v)));
  };

  const onPad = (k: string) => {
    if (k === "clear") return set(focus, 0);
    if (k === "back") return set(focus, Math.floor(get(focus) / 10));
    const cur = get(focus);
    const next = cur * 10 + Number(k);
    set(focus, focus === "rpe" ? Math.min(10, next) : next);
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
      rir: 10 - rpe,
    });
  };

  return (
    <>
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-black/50 z-[90]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-label={`Log set ${setIdx + 1} for ${exerciseName}`}
        className="fixed bottom-0 left-0 right-0 z-[91] bg-ft-surface border-t border-ft-border rounded-ft px-4 pt-3 pb-5 max-w-2xl mx-auto"
        style={{ boxShadow: "0 -20px 40px rgba(0,0,0,.3)" }}
      >
        {/* grabber */}
        <div className="w-9 h-1 bg-ft-dim/40 rounded mx-auto mb-3" aria-hidden />

        {/* context row */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="font-data text-[10px] uppercase tracking-[0.15em] text-ft-dim">
              {category ? `${category.toUpperCase()} · ` : ""}SET {setIdx + 1}
            </div>
            <div className="font-display text-base text-ft-white truncate mt-0.5">
              {exerciseName}
            </div>
          </div>
          {lastWeek?.weight != null && (
            <button
              onClick={matchLast}
              className="shrink-0 bg-ft-card border border-ft-border/60 rounded-ft px-2.5 py-1.5 text-left"
            >
              <div className="font-data text-[9px] tracking-[0.12em] text-ft-dim">LAST</div>
              <div className="font-data text-[13px] text-ft-white font-semibold tabular-nums">
                {lastWeek.weight}×{lastWeek.reps}
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
          />
          <FieldButton
            label="REPS"
            value={reps}
            unit={targetReps ? `target ${targetReps}` : ""}
            active={focus === "reps"}
            onClick={() => setFocus("reps")}
          />
          <FieldButton
            label="RPE"
            value={rpe}
            unit={targetRpe ? `target @${targetRpe}` : "1–10"}
            active={focus === "rpe"}
            onClick={() => setFocus("rpe")}
          />
        </div>

        {/* quick weight adjusters when weight is focused */}
        {focus === "weight" && (
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <QuickBtn onClick={() => setWeight(Math.max(0, weight - 5))}>− 5</QuickBtn>
            <QuickBtn onClick={() => setWeight(weight + 2.5)}>+ 2.5</QuickBtn>
            <QuickBtn onClick={() => setWeight(weight + 5)}>+ 5</QuickBtn>
            <QuickBtn onClick={() => setWeight(weight + 10)}>+ 10</QuickBtn>
          </div>
        )}

        {/* keypad */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const).map((k) => (
            <PadKey key={k} k={k} onClick={() => onPad(k)} />
          ))}
        </div>

        {/* actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-transparent border border-ft-border/60 rounded-ft text-ft-light font-body text-[13px] font-semibold uppercase tracking-[0.1em]"
          >
            Cancel
          </button>
          <button
            onClick={commit}
            className="flex-[2] py-3 bg-ft-accent text-ft-bg border border-ft-accent rounded-ft font-body text-[13px] font-bold uppercase tracking-[0.1em]"
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
}: {
  label: string;
  value: number;
  unit: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "py-2 px-2.5 rounded-ft text-center transition-colors",
        active ? "bg-ft-accent/15 border border-ft-accent" : "bg-ft-card border border-ft-border/40",
      ].join(" ")}
    >
      <div className="font-data text-[9px] tracking-[0.12em] text-ft-dim">{label}</div>
      <div className="font-data text-2xl font-bold leading-tight text-ft-white tabular-nums">
        {value}
      </div>
      {unit && <div className="font-data text-[9px] text-ft-dim truncate">{unit}</div>}
    </button>
  );
}

function QuickBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-2 bg-ft-card border border-ft-border/60 rounded-ft text-ft-light font-body text-[13px] font-semibold"
    >
      {children}
    </button>
  );
}

function PadKey({ k, onClick }: { k: string; onClick: () => void }) {
  const isAction = k === "clear" || k === "back";
  return (
    <button
      onClick={onClick}
      className={[
        "py-3.5 rounded-ft border border-ft-border/40 text-ft-white font-body text-xl font-semibold tabular-nums",
        isAction ? "bg-ft-card" : "bg-ft-surface",
      ].join(" ")}
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
  const first = parseInt(target.split("-")[0], 10);
  return Number.isFinite(first) ? first : null;
}
