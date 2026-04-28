"use client";

import type { MovementCat } from "./types";

interface SetCellProps {
  setIdx: number;
  weight: number | null;
  reps: number | null;
  done: boolean;
  /** Last-week values for ghost-state preview. */
  ghost?: { weight: number | null; reps: number | null } | null;
  isActive: boolean;
  cat: MovementCat;
  onTap: () => void;
}

/**
 * Tappable square cell for a single set within an exercise lane.
 *
 * Three visual states:
 *   - empty    — center dot, dashed-feel border, taps open SetSheet
 *   - ghost    — last-week's values rendered dim (when provided)
 *   - filled   — current weight × reps in display weight, check corner
 *
 * Surface tinting is theme-driven via tokens; per-theme refinements
 * live in globals.css (e.g. notebook italic ghost, arcade neon tint)
 * if/when we add them. Default treatment uses ft-card / ft-accent.
 */
export default function SetCell({
  setIdx,
  weight,
  reps,
  done,
  ghost,
  isActive,
  cat,
  onTap,
}: SetCellProps) {
  const filled = done && weight != null;
  const showGhost = !filled && !!(ghost && ghost.weight != null);
  const catVar = `var(--ft-${cat})`;

  return (
    <button
      onClick={onTap}
      aria-label={
        filled
          ? `Set ${setIdx + 1}: ${weight} × ${reps}, edit`
          : `Set ${setIdx + 1}: empty, log set`
      }
      className={[
        "relative aspect-square min-h-[52px] min-w-0 flex flex-col items-center justify-center rounded-ft transition-colors",
        "border touch-target overflow-hidden",
        filled
          ? "bg-ft-accent/10 border-ft-accent/60"
          : "bg-ft-card border-ft-border/55 hover:border-ft-accent/50",
        isActive ? "!bg-ft-accent/20 !border-ft-accent" : "",
      ].join(" ")}
    >
      {/* set number corner */}
      <span className="absolute top-0.5 left-1 font-data text-[8px] tracking-[0.05em] text-ft-dim">
        {setIdx + 1}
      </span>

      {/* check corner when filled */}
      {filled && (
        <span
          className="absolute top-0.5 right-1"
          aria-hidden
          style={{ color: `rgb(${catVar})` }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}

      {filled ? (
        <>
          <span className="font-data text-xl font-bold leading-none text-ft-white tabular-nums">
            {fmtWeight(weight)}
          </span>
          <span className="font-data text-[11px] text-ft-dim mt-0.5 tabular-nums">
            ×{reps}
          </span>
        </>
      ) : showGhost && ghost ? (
        <>
          <span className="font-data text-base leading-none text-ft-dim/90 font-medium tabular-nums">
            {fmtWeight(ghost.weight)}
          </span>
          <span className="font-data text-[10px] text-ft-dim/70 mt-0.5 tabular-nums">
            ×{ghost.reps}
          </span>
        </>
      ) : (
        <span className="text-sm text-ft-dim/50">·</span>
      )}
    </button>
  );
}

/** "Add set" trailing affordance shown after the last cell. */
export function AddSetCell({ onTap }: { onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      aria-label="Add set"
      className="aspect-square min-h-[52px] min-w-[36px] flex flex-col items-center justify-center rounded-ft border border-dashed border-ft-border/70 text-ft-dim hover:bg-ft-accent/5 hover:border-ft-accent/55 hover:text-ft-accent transition-colors touch-target"
    >
      <span className="text-base leading-none">+</span>
      <span className="font-data text-[8px] tracking-[0.12em] uppercase opacity-80 mt-0.5">
        SET
      </span>
    </button>
  );
}

function fmtWeight(w: number | null): string {
  if (w == null) return "—";
  if (Number.isInteger(w)) return String(w);
  return w.toFixed(1).replace(/\.0$/, "");
}
