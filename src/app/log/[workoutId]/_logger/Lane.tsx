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
  category?: string | null;
  movementPattern?: string | null;
  targetSets?: number | null;
  targetRepRange?: string | null;
  targetRpe?: string | null;
  sets: LaneSet[];
  /** Optional last-week values for ghost previews. Index-aligned to sets. */
  lastWeek?: Array<{ weight: number | null; reps: number | null }> | null;
  activeCellIdx: number | null;
  onTapSet: (setIdx: number) => void;
  onAddSet: () => void;
  onSwap: () => void;
  onRemove: () => void;
}

const MAX_SETS_PER_LANE = 6;

/**
 * Compact exercise row: name + meta on top, set cells across the bottom.
 * Tapping a cell delegates up to the page to open the SetSheet.
 *
 * The `+ SET` trailing cell appears when the lane has fewer than
 * MAX_SETS_PER_LANE sets. Beyond that the row pattern stops being
 * usable on a phone — power users can switch back to the older
 * stacked layout in a future toggle.
 */
export default function Lane({
  name,
  category,
  movementPattern,
  targetSets,
  targetRepRange,
  sets,
  lastWeek,
  activeCellIdx,
  onTapSet,
  onAddSet,
  onSwap,
  onRemove,
}: LaneProps) {
  const cat = movementCat(movementPattern);
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;

  return (
    <div
      className="ft-card bg-ft-surface border border-ft-border p-3 border-l-4"
      style={{ borderLeftColor: `rgb(var(--ft-${cat}))` }}
    >
      {/* lane header */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] text-ft-white tracking-wide leading-tight truncate">
            {name}
          </h3>
          <div className="font-data text-[10px] uppercase tracking-[0.15em] text-ft-dim mt-0.5 flex items-center gap-1.5 flex-wrap">
            {category && <span style={{ color: `rgb(var(--ft-${cat}))` }}>{category}</span>}
            {targetSets && targetRepRange && (
              <>
                <span>·</span>
                <span className="tabular-nums">
                  {targetSets}×{targetRepRange}
                </span>
              </>
            )}
            <span>·</span>
            <span className="tabular-nums">
              {doneCount}/{sets.length} done
            </span>
            {allDone && <span className="text-ft-success">✓</span>}
          </div>
        </div>
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
      </div>

      {/* set row */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: gridCols(sets.length, sets.length < MAX_SETS_PER_LANE) }}>
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
            onTap={() => onTapSet(i)}
          />
        ))}
        {sets.length < MAX_SETS_PER_LANE && <AddSetCell onTap={onAddSet} />}
      </div>
    </div>
  );
}

function gridCols(setCount: number, includeAdd: boolean): string {
  const cells = setCount + (includeAdd ? 1 : 0);
  return `repeat(${cells || 1}, minmax(0, 1fr))`;
}
