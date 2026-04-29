"use client";

import SetCell, { AddSetCell } from "./SetCell";
import { movementCat } from "./types";

interface LaneSet {
  weight: number | null;
  reps: number | null;
  done: boolean;
}

interface LaneProps {
  name: string;
  /** Movement-pattern accent color key (push/pull/legs/core). */
  movementPattern?: string | null;
  /** Specific muscle/category to render on the vertical rail. Falls back to movementPattern. */
  category?: string | null;
  targetSets?: number | null;
  targetRepRange?: string | null;
  sets: LaneSet[];
  /** Optional last-week values for ghost previews. Index-aligned to sets. */
  lastWeek?: Array<{ weight: number | null; reps: number | null }> | null;
  activeCellIdx: number | null;
  /** When true, set cells render filled-only and don't open the sheet. */
  readOnly?: boolean;
  onTapSet: (setIdx: number) => void;
  onAddSet: () => void;
  onSwap: () => void;
  onRemove: () => void;
}

const MAX_SETS_PER_LANE = 6;

/**
 * Compact exercise row matching the prototype's logger layout:
 *
 *   ┌──────┬──────────────────────────────────────────────┐
 *   │      │  Bench Press — Incline Barbell               │
 *   │ CAT  │  3×6-8                                       │
 *   │ ▌▌▌  │  ┌────┬────┬────┬────┬────┬────┐             │
 *   │      │  │ 1  │ 2  │ 3  │ 4  │ 5  │ +  │             │
 *   │      │  │ 190│ 190│ 190│ 185│ 180│SET │             │
 *   │      │  │ ×8 │ ×8 │ ×7 │ ×7 │ ×7 │    │             │
 *   │      │  └────┴────┴────┴────┴────┴────┘             │
 *   └──────┴──────────────────────────────────────────────┘
 *      ^ vertical category rail (rotated text on movement-color tint)
 *
 * The rail is the prototype's primary visual signature for the lane and
 * was missing from the prior port. Cells flow horizontally and shrink
 * typography in `dense` mode (≥5 cells) so 6 still fit on a 360px phone.
 */
export default function Lane({
  name,
  movementPattern,
  category,
  targetSets,
  targetRepRange,
  sets,
  lastWeek,
  activeCellIdx,
  readOnly = false,
  onTapSet,
  onAddSet,
  onSwap,
  onRemove,
}: LaneProps) {
  const cat = movementCat(movementPattern);
  const railLabel = (category ?? cat).toUpperCase();
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const totalCells = sets.length + (sets.length < MAX_SETS_PER_LANE && !readOnly ? 1 : 0);
  const dense = totalCells >= 5;

  return (
    <div className="ft-card flex bg-ft-surface border border-ft-border overflow-hidden rounded-ft">
      {/* Vertical category rail — rotated text on movement-color tint */}
      <div
        className="relative shrink-0 flex items-center justify-center self-stretch"
        style={{
          width: 44,
          background: `rgb(${`var(--ft-${cat})`} / 0.85)`,
        }}
        aria-hidden
      >
        <span
          className="font-body text-[11px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap text-white"
          style={{ transform: "rotate(-90deg)" }}
        >
          {railLabel}
        </span>
      </div>

      {/* Right side — header + cells */}
      <div className="flex-1 min-w-0 px-3 py-2.5">
        {/* Header row: exercise name + actions, target chip below */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] text-ft-white tracking-wide leading-tight truncate">
              {name}
            </h3>
            <div className="font-data text-[10px] uppercase tracking-[0.15em] text-ft-dim mt-0.5 flex items-center gap-1.5 flex-wrap">
              {targetSets && targetRepRange && (
                <span className="tabular-nums">
                  {targetSets}×{targetRepRange}
                </span>
              )}
              {targetSets && targetRepRange && <span>·</span>}
              <span className="tabular-nums">
                {doneCount}/{sets.length} done
              </span>
              {allDone && <span className="text-ft-success">✓</span>}
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={onSwap}
                className="text-ft-dim hover:text-ft-light text-[10px] font-body uppercase tracking-[0.1em] border border-ft-border/60 px-2 py-1 rounded-ft"
                aria-label={`Swap ${name}`}
              >
                Swap
              </button>
              <button
                onClick={onRemove}
                className="text-ft-dim hover:text-ft-danger text-[10px] font-body uppercase tracking-[0.1em] border border-ft-border/60 px-2 py-1 rounded-ft"
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Set cells */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${Math.max(totalCells, 1)}, minmax(0, 1fr))`,
            gap: dense ? "3px" : "6px",
          }}
        >
          {sets.map((s, i) => (
            <SetCell
              key={i}
              setIdx={i}
              weight={s.weight}
              reps={s.reps}
              done={s.done}
              ghost={lastWeek?.[i] ?? null}
              isActive={activeCellIdx === i}
              cat={cat}
              dense={dense}
              disabled={readOnly}
              onTap={() => onTapSet(i)}
            />
          ))}
          {sets.length < MAX_SETS_PER_LANE && !readOnly && (
            <AddSetCell onTap={onAddSet} dense={dense} />
          )}
        </div>
      </div>
    </div>
  );
}
