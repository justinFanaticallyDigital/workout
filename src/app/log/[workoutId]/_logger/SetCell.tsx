"use client";

import { fmtWeight } from "./util";

interface SetCellProps {
  setIdx: number;
  weight: number | null;
  reps: number | null;
  done: boolean;
  /** Last session's same set, shown as a ghost under the cell. */
  ghost?: { weight: number | null; reps: number | null } | null;
  isActive: boolean;
  /** Five or more cells in a lane: shrink the numerals. */
  dense?: boolean;
  onTap: () => void;
}

/**
 * One set in a lane. done → teal-faint fill + teal border, weight × reps;
 * active → stronger teal fill; open → dashed border and "—". The previous
 * session's value sits under every cell as a ghost.
 */
export default function SetCell({ setIdx, weight, reps, done, ghost, isActive, dense = false, onTap }: SetCellProps) {
  const filled = done && weight != null;
  const box = filled
    ? "border-[1.5px] border-ft-accent bg-ft-accent/[.12]"
    : isActive
      ? "border-[1.5px] border-ft-accent bg-ft-accent/20"
      : "border-[1.2px] border-dashed border-ft-border bg-transparent";
  return (
    <div className="flex min-w-[58px] max-w-[96px] flex-1 flex-col gap-[3px]">
      <button
        type="button"
        onClick={onTap}
        aria-label={filled ? `Set ${setIdx + 1}: ${weight} × ${reps}, edit` : `Set ${setIdx + 1}: open, log set`}
        className={`flex aspect-[1/0.85] min-h-[56px] w-full flex-col items-center justify-center rounded-ft-md transition-colors ${box}`}
      >
        {filled || (isActive && weight != null) ? (
          <>
            <span className={`font-data font-bold leading-none text-ft-white ${dense ? "text-[15px]" : "text-[18px]"}`}>{fmtWeight(weight)}</span>
            <span className={`mt-0.5 font-data font-bold text-ft-accent ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>× {reps ?? "—"}</span>
          </>
        ) : (
          <span className="font-data text-[12px] text-ft-dim">—</span>
        )}
      </button>
      <div className="min-h-[12px] text-center font-data text-[9.5px] tracking-[0.04em] text-ft-dim">
        {ghost && ghost.weight != null ? `${fmtWeight(ghost.weight)}×${ghost.reps ?? "—"}` : " "}
      </div>
    </div>
  );
}

/** Trailing "+" cell that appends a set. */
export function AddSetCell({ onTap }: { onTap: () => void }) {
  return (
    <div className="flex min-w-[58px] max-w-[96px] flex-1 flex-col gap-[3px]">
      <button
        type="button"
        onClick={onTap}
        aria-label="Add set"
        className="flex aspect-[1/0.85] min-h-[56px] w-full items-center justify-center rounded-ft-md border-[1.2px] border-dashed border-ft-border text-ft-accent"
      >
        <span className="font-data text-[18px] leading-none">+</span>
      </button>
      <div className="min-h-[12px]">&nbsp;</div>
    </div>
  );
}
