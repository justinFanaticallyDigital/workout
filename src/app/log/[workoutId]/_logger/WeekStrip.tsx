"use client";

import { useTheme } from "@/providers/ThemeProvider";

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
 * Horizontal week selector. Ports `WeekStrip` from logger-app.jsx
 * (lines 161–237) verbatim with all per-chrome `themeStyles` branches
 * preserved.
 *
 * Per-chrome attestations:
 *   iron      → transparent base, accent border on active, brass-tinted complete text
 *   lab       → card-bg base, solid accent fill on active (white text), 4px radius
 *   notebook  → transparent base, 2px accent border on active, 20px pill radius
 *   arcade    → surface base, cyan fill on active (#000 text), sharp corners
 *   blueprint → translucent accent fill on active, sharp corners
 *   cyberpunk → translucent accent fill on active, sharp corners
 *   graffiti  → translucent accent fill on active, sharp corners
 *
 * Live-app compromise vs prototype:
 *   The prototype assumes lane.sets is a 2-D array indexed by weekIdx.
 *   Our schema stores per-workout sets, so "viewing past weeks" means
 *   pulling sibling Workout rows that share the same blockDayId. We
 *   surface that read-only override in the page; this component is
 *   purely the visual selector.
 */
export default function WeekStrip({ weeks, selected, onSelect }: Props) {
  const { chrome } = useTheme();
  if (weeks.length === 0) return null;

  const styles = themeStyles(chrome);

  return (
    <div
      className="grid"
      style={{
        gap: 6,
        padding: "8px 16px 10px",
        gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
        borderBottom: "1px solid rgb(var(--ft-border) / 0.5)",
      }}
    >
      {weeks.map((w) => {
        const isSelected = w.weekIdx === selected;
        const tappable = w.isCurrent || w.pastComplete;
        const labelColor = isSelected
          ? styles.activeColor
          : w.pastComplete
          ? styles.completeColor
          : styles.inactiveColor;
        return (
          <button
            key={w.weekIdx}
            onClick={() => tappable && onSelect(w.weekIdx)}
            disabled={!tappable}
            aria-pressed={isSelected}
            style={{
              padding: "6px 4px",
              cursor: tappable ? "pointer" : "not-allowed",
              background: isSelected ? styles.activeBg : styles.bg,
              border: isSelected ? styles.activeBorder : "1px solid transparent",
              borderRadius: styles.radius,
              color: labelColor,
              transition: "all .15s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              opacity: tappable ? 1 : 0.4,
              fontFamily: "inherit",
            }}
          >
            <span
              className="font-data tabular-nums"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              {w.label}
            </span>
            <span
              style={{
                fontSize: 9,
                opacity: 0.85,
                letterSpacing: chrome === "arcade" ? 0 : ".05em",
              }}
            >
              {w.isCurrent ? "TODAY" : w.date ?? "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ThemeStyles {
  bg: string;
  activeBg: string;
  activeBorder: string;
  inactiveColor: string;
  activeColor: string;
  completeColor: string;
  radius: number;
}

function themeStyles(chrome: string): ThemeStyles {
  const base: ThemeStyles = {
    bg: "transparent",
    activeBg: "rgb(var(--ft-accent) / 0.15)",
    activeBorder: "1px solid rgb(var(--ft-accent))",
    inactiveColor: "rgb(var(--ft-text-tertiary))",
    activeColor: "rgb(var(--ft-accent))",
    completeColor: "rgb(var(--ft-text-primary))",
    radius: 0,
  };
  switch (chrome) {
    case "iron":
      return { ...base };
    case "lab":
      return {
        ...base,
        bg: "rgb(var(--ft-surface))",
        activeBg: "rgb(var(--ft-accent))",
        activeColor: "rgb(var(--ft-text-on-accent))",
        radius: 4,
      };
    case "notebook":
      return {
        ...base,
        activeBg: "transparent",
        activeBorder: "2px solid rgb(var(--ft-accent))",
        radius: 20,
      };
    case "arcade":
      return {
        ...base,
        bg: "rgb(var(--ft-surface))",
        activeBg: "rgb(var(--ft-info-fg))",
        activeBorder: "1px solid rgb(var(--ft-info-fg))",
        activeColor: "rgb(var(--ft-bg))",
      };
    default:
      // blueprint / cyberpunk / graffiti — translucent accent fill,
      // sharp corners, R0 token-driven.
      return base;
  }
}
