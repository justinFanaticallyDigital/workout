"use client";

import { useEffect, useState } from "react";
import { Btn } from "@/components/kit";
import { categoryFor } from "@/lib/categories";
import { fmtWeight } from "./util";
import type { Suggestion } from "./types";

interface SetSheetProps {
  exerciseName: string;
  movementPattern?: string | null;
  primaryMuscle?: string | null;
  setIdx: number;
  targetReps?: string | null;
  targetRpe?: string | null;
  /** Current set if editing, else null fields. */
  initial: { weight: number | null; reps: number | null; rir: number | null };
  /** Last session's same set. */
  last?: { weight: number | null; reps: number | null } | null;
  suggestion?: Suggestion | null;
  onCommit: (values: { weight: number; reps: number; rir: number | null }) => void;
  onCancel: () => void;
}

type Field = "weight" | "reps" | "rpe";

/**
 * Inline weight / reps / RPE entry for one set. Three tappable fields route
 * the keypad; quick weight adjusters appear under WEIGHT; LAST and SUGGESTED
 * pills pre-fill. RPE is stored as rir = 10 − rpe (the /api/sets contract).
 */
export default function SetSheet({ exerciseName, movementPattern, primaryMuscle, setIdx, targetReps, targetRpe, initial, last, suggestion, onCommit, onCancel }: SetSheetProps) {
  const [weight, setWeight] = useState<number>(initial.weight ?? last?.weight ?? suggestion?.weight ?? 0);
  const [reps, setReps] = useState<number>(initial.reps ?? last?.reps ?? parseFirst(targetReps) ?? 8);
  const [rpe, setRpe] = useState<number>(initial.rir != null ? 10 - initial.rir : parseFirst(targetRpe) ?? 8);
  const [focus, setFocus] = useState<Field>(initial.weight == null ? "weight" : "reps");
  const [fresh, setFresh] = useState(true); // first digit replaces the pre-filled value

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  const get = (f: Field) => (f === "weight" ? weight : f === "reps" ? reps : rpe);
  const set = (f: Field, v: number) => {
    if (f === "weight") setWeight(v);
    else if (f === "reps") setReps(v);
    else setRpe(Math.max(0, Math.min(10, v)));
  };
  const pickField = (f: Field) => {
    setFocus(f);
    setFresh(true);
  };
  const onPad = (k: string) => {
    if (k === "clear") {
      setFresh(true);
      return set(focus, 0);
    }
    if (k === "back") {
      setFresh(false);
      if (focus === "rpe") return set("rpe", 0);
      return set(focus, Math.floor(get(focus) / 10));
    }
    const digit = Number(k);
    const cur = fresh ? 0 : get(focus);
    setFresh(false);
    if (focus === "rpe") {
      if (cur === 1 && digit === 0) return set("rpe", 10);
      if (digit === 0) return;
      return set("rpe", digit);
    }
    set(focus, cur * 10 + digit);
  };

  const cat = categoryFor(movementPattern, primaryMuscle);
  const commit = () => onCommit({ weight, reps, rir: rpe === 0 ? null : 10 - rpe });

  return (
    <>
      <button type="button" aria-label="Cancel" onClick={onCancel} className="fixed inset-0 z-[90] bg-[#1F2A28]/40" />
      <div
        role="dialog"
        aria-label={`Log set ${setIdx + 1} for ${exerciseName}`}
        className="fixed inset-x-0 bottom-0 z-[91] mx-auto max-w-[600px] rounded-t-ft-lg border-t border-ft-border bg-ft-surface px-4 pt-2.5 shadow-ft-md pb-safe"
      >
        <div className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-ft-border" />

        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="t-eyebrow">
              {cat.label} · Set {setIdx + 1}
            </div>
            <div className="mt-0.5 truncate font-data text-[14.5px] font-bold text-ft-white">{exerciseName}</div>
          </div>
          <div className="flex flex-shrink-0 gap-1.5">
            {suggestion && suggestion.weight > 0 && (
              <PrefillPill label="Suggested" value={`${fmtWeight(suggestion.weight)}${suggestion.reps ? `×${suggestion.reps}` : ""}`} hint={suggestion.hint} onClick={() => { setWeight(suggestion.weight); if (suggestion.reps) setReps(suggestion.reps); setFresh(true); }} />
            )}
            {last?.weight != null && (
              <PrefillPill label="Last" value={`${fmtWeight(last.weight)}×${last.reps ?? "—"}`} onClick={() => { setWeight(last.weight!); if (last.reps != null) setReps(last.reps); setFresh(true); }} />
            )}
          </div>
        </div>

        <div className="mb-2 grid grid-cols-3 gap-1.5">
          <FieldTile label="Weight" value={fmtWeight(weight)} unit="lb" active={focus === "weight"} onClick={() => pickField("weight")} />
          <FieldTile label="Reps" value={String(reps)} unit={targetReps ? `target ${targetReps.replace("-", "–")}` : ""} active={focus === "reps"} onClick={() => pickField("reps")} />
          <FieldTile label="RPE" value={rpe === 0 ? "—" : String(rpe)} unit={targetRpe ? `target @${targetRpe}` : "1–10"} active={focus === "rpe"} onClick={() => pickField("rpe")} />
        </div>

        {focus === "weight" && (
          <div className="mb-2 grid grid-cols-4 gap-1.5">
            {[-5, 2.5, 5, 10].map((d) => (
              <button key={d} type="button" onClick={() => { setWeight(Math.max(0, weight + d)); setFresh(true); }} className="rounded-ft-md border border-ft-border bg-ft-surface-alt py-2 font-data text-[13px] font-semibold text-ft-light">
                {d > 0 ? `+ ${d}` : `− ${Math.abs(d)}`}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {(["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const).map((k) => {
            const action = k === "clear" || k === "back";
            return (
              <button
                key={k}
                type="button"
                onClick={() => onPad(k)}
                className={["rounded-ft-md border border-ft-border py-3 font-data text-[20px] font-semibold tabular-nums text-ft-white", action ? "bg-ft-surface-alt" : "bg-ft-surface-raised"].join(" ")}
                aria-label={k === "back" ? "Backspace" : k === "clear" ? "Clear" : k}
              >
                {k === "back" ? "⌫" : k === "clear" ? "C" : k}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <Btn kind="quiet" className="flex-1" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn className="flex-[2]" onClick={commit} disabled={reps <= 0}>
            Log set
          </Btn>
        </div>
      </div>
    </>
  );
}

function FieldTile({ label, value, unit, active, onClick }: { label: string; value: string; unit: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["rounded-ft-md border px-2 py-2 text-center", active ? "border-ft-accent bg-ft-accent/[.12]" : "border-ft-border bg-ft-surface-raised"].join(" ")}
    >
      <div className="t-eyebrow !text-[9px]">{label}</div>
      <div className="font-data text-[26px] font-bold leading-[1.05] tabular-nums text-ft-white">{value}</div>
      <div className="truncate font-data text-[9px] text-ft-dim">{unit || " "}</div>
    </button>
  );
}

function PrefillPill({ label, value, hint, onClick }: { label: string; value: string; hint?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={hint} className="rounded-ft-md border border-ft-border bg-ft-surface-alt px-2.5 py-1.5 text-left">
      <div className="t-eyebrow !text-[8.5px]">{label}</div>
      <div className="font-data text-[13px] font-semibold tabular-nums text-ft-white">{value}</div>
    </button>
  );
}

function parseFirst(target: string | null | undefined): number | null {
  if (!target) return null;
  const first = parseFloat(target.split(/[-–]/)[0]);
  return Number.isFinite(first) ? first : null;
}
