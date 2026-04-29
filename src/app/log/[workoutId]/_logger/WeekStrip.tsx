"use client";

export interface WeekTab {
  /** Zero-indexed position in the block. */
  weekIdx: number;
  /** Display label, e.g. "W1". */
  label: string;
  /** Short date string for the kicker, e.g. "02/03". null for future weeks. */
  date: string | null;
  /** A workout was logged for this week (past) — show as completed. */
  pastComplete: boolean;
  /** True for the current workout's week — editable / always selectable. */
  isCurrent: boolean;
}

interface Props {
  weeks: WeekTab[];
  selected: number;
  onSelect: (weekIdx: number) => void;
}

/**
 * Horizontal week selector matching the prototype's WeekStrip.
 *
 * Renders one cell per week in the block. Selected cell highlights with
 * accent border. Past completed weeks are tappable (read-only view of
 * that session's sets); future weeks are dim and disabled. The current
 * week's date label is replaced with "TODAY".
 *
 * Live-app compromise vs prototype:
 *   The prototype assumes lane.sets is a 2-D array indexed by weekIdx.
 *   Our schema stores per-workout sets, so "viewing past weeks" means
 *   pulling sibling Workout rows that share the same blockDayId. We
 *   surface that read-only override in the page; this component is
 *   purely the visual selector.
 */
export default function WeekStrip({ weeks, selected, onSelect }: Props) {
  if (weeks.length === 0) return null;
  return (
    <div
      className="grid gap-1.5 px-4 py-3 border-b border-ft-border/50"
      style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
    >
      {weeks.map((w) => {
        const isSelected = w.weekIdx === selected;
        const tappable = w.isCurrent || w.pastComplete;
        return (
          <button
            key={w.weekIdx}
            onClick={() => tappable && onSelect(w.weekIdx)}
            disabled={!tappable}
            aria-pressed={isSelected}
            className={[
              "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-ft border transition-colors",
              isSelected
                ? "bg-ft-accent/15 border-ft-accent"
                : tappable
                ? "bg-transparent border-transparent hover:border-ft-border"
                : "bg-transparent border-transparent opacity-40 cursor-not-allowed",
            ].join(" ")}
          >
            <span
              className={[
                "font-data text-sm font-semibold tabular-nums",
                isSelected
                  ? "text-ft-accent"
                  : w.pastComplete
                  ? "text-ft-light"
                  : "text-ft-dim",
              ].join(" ")}
            >
              {w.label}
            </span>
            <span
              className={[
                "font-body text-[9px] tracking-[0.05em]",
                isSelected ? "text-ft-accent" : "text-ft-dim",
              ].join(" ")}
            >
              {w.isCurrent ? "TODAY" : w.date ?? "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
