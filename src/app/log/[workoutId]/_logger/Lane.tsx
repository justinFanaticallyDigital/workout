"use client";

import { useTheme } from "@/providers/ThemeProvider";
import SetCell, { AddSetCell } from "./SetCell";
import TargetChip from "./TargetChip";
import { movementCat } from "./types";

interface LaneSet {
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

interface LaneProps {
  name: string;
  /** Movement-pattern accent color key (push/pull/legs/core). */
  movementPattern?: string | null;
  /** Specific muscle/category to render on the vertical rail. */
  primaryMuscle?: string | null;
  /** Fallback rail label when neither primaryMuscle nor movementPattern is set. */
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
 * Compact exercise row matching logger-app.jsx#Lane (lines 241–434).
 *
 *   ┌──────┬──────────────────────────────────────────────┐
 *   │      │  Bench Press — Incline Barbell        3×6-8  │
 *   │ CAT  │  ┌────┬────┬────┬────┬────┬────┐             │
 *   │ ▌▌▌  │  │ 1  │ 2  │ 3  │ 4  │ 5  │ +  │             │
 *   │      │  │ 190│ 190│ 190│ 185│ 180│SET │             │
 *   │      │  │ ×8 │ ×8 │ ×7 │ ×7 │ ×7 │    │             │
 *   │      │  └────┴────┴────┴────┴────┴────┘             │
 *   └──────┴──────────────────────────────────────────────┘
 *      ^ vertical category rail (rotated text on movement-color tint)
 *
 * Per-chrome attestations (rail label font + chip styling):
 *   notebook  → rotated rail label in Caveat lowercase (margin-scribble feel),
 *               chip rotated -6° in handwritten Caveat
 *   arcade    → Press Start 2P at 9px tracked-zero,
 *               sharp 8-bit chip with low spacing
 *   lab       → IBM Plex Sans tracked caps,
 *               clinical rounded-3 specimen sticker chip
 *   iron      → Stardos Stencil tracked caps, sharp tag chip
 *   blueprint → Major Mono Display tracked caps, sharp default chip
 *   cyberpunk → Share Tech Mono tracked caps, sharp default chip
 *   graffiti  → Permanent Marker tracked caps, sharp default chip
 *
 * The rail uses the most specific muscle label available
 * (`primaryMuscle` from the Exercise model) and falls back to the
 * pattern key. Prototype's "Lateral Delt" → live's "delts" / "push".
 *
 * VARIANT DROPDOWN — the prototype has a per-exercise variant
 * dropdown (`VariantDropdown`, logger-app.jsx#439-500). The required
 * `BlockDayExercise.variants String[]` schema column landed in R6 and
 * is serialized by `/api/blocks/day/[id]`, but the UI still uses the
 * existing `Swap` button → `ExercisePicker` flow. A future UI-only
 * pass will wire the dropdown directly.
 */
export default function Lane({
  name,
  movementPattern,
  primaryMuscle,
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
  const { chrome } = useTheme();
  const cat = movementCat(movementPattern);
  // Per the prototype, the rail label uses the most specific muscle name.
  // Fall back chain: primaryMuscle → movementPattern → category → cat key.
  const railLabel = (primaryMuscle ?? movementPattern ?? category ?? cat).toUpperCase();
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const totalCells = sets.length + (sets.length < MAX_SETS_PER_LANE && !readOnly ? 1 : 0);
  const dense = totalCells >= 5;

  // Per-chrome rail label font (logger-app.jsx#252-279).
  const railFont = railLabelFont(chrome);

  return (
    <div
      className="ft-card flex overflow-hidden"
      style={{
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: chrome === "lab" ? 8 : chrome === "notebook" ? 6 : 0,
      }}
    >
      {/* Vertical category rail — rotated text on movement-color tint */}
      <div
        className="relative shrink-0 self-stretch"
        style={{
          width: 44,
          background: `rgb(var(--ft-${cat}) / 0.85)`,
          borderTopLeftRadius: chrome === "lab" ? 8 : 0,
          borderBottomLeftRadius: chrome === "lab" ? 8 : 0,
        }}
        aria-hidden
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            whiteSpace: "nowrap",
            color: "#fff",
            ...railFont,
          }}
        >
          {chrome === "notebook" ? railLabel.toLowerCase() : railLabel}
        </div>
      </div>

      {/* Right side — header + cells */}
      <div
        className="flex-1 min-w-0"
        style={{
          padding: chrome === "notebook" ? "10px 14px 12px" : "10px 12px 12px",
        }}
      >
        {/* Header row: exercise name + actions, target chip below */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3
              className="font-display tracking-wide leading-tight truncate"
              style={{
                fontSize: chrome === "notebook" ? 19 : 15,
                color: "rgb(var(--ft-text-primary))",
              }}
            >
              {name}
            </h3>
            <div
              className="font-data mt-0.5 flex items-center gap-1.5 flex-wrap"
              style={{
                fontSize: 10,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "rgb(var(--ft-text-tertiary))",
              }}
            >
              <span className="tabular-nums">
                {doneCount}/{sets.length} done
              </span>
              {allDone && (
                <span style={{ color: "rgb(var(--ft-success-fg))" }}>✓</span>
              )}
            </div>
          </div>
          <TargetChip targetSets={targetSets} targetRepRange={targetRepRange} />
          {!readOnly && (
            <div className="flex gap-1 shrink-0 ml-1">
              <button
                onClick={onSwap}
                className="font-body"
                aria-label={`Swap ${name}`}
                style={{
                  fontSize: 10,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "rgb(var(--ft-text-tertiary))",
                  border: "1px solid rgb(var(--ft-border) / 0.6)",
                  borderRadius: chrome === "lab" ? 4 : 0,
                  padding: "3px 7px",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Swap
              </button>
              <button
                onClick={onRemove}
                className="font-body"
                aria-label={`Remove ${name}`}
                style={{
                  fontSize: 10,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "rgb(var(--ft-text-tertiary))",
                  border: "1px solid rgb(var(--ft-border) / 0.6)",
                  borderRadius: chrome === "lab" ? 4 : 0,
                  padding: "3px 7px",
                  background: "transparent",
                  cursor: "pointer",
                }}
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
            gap: dense ? 3 : 6,
          }}
        >
          {sets.map((s, i) => (
            <SetCell
              key={i}
              setIdx={i}
              weight={s.weight}
              reps={s.reps}
              rir={s.rir}
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

/**
 * Per-chrome rail label typography. Verbatim port of logger-app.jsx
 * lines 252–279 — preserves notebook's Caveat-margin-scribble feel
 * and arcade's Press Start 2P stipple.
 */
function railLabelFont(chrome: string): React.CSSProperties {
  switch (chrome) {
    case "notebook":
      return {
        fontFamily: "Caveat, var(--ft-font-display)",
        fontSize: 19,
        fontWeight: 600,
        letterSpacing: 0,
        textTransform: "lowercase",
      };
    case "arcade":
      return {
        fontFamily: "'Press Start 2P', var(--ft-font-display)",
        fontSize: 8,
        fontWeight: 400,
        letterSpacing: 0,
        textTransform: "uppercase",
      };
    default:
      // iron / lab / blueprint / cyberpunk / graffiti share tracked caps.
      return {
        fontFamily: "inherit",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".18em",
        textTransform: "uppercase",
      };
  }
}
