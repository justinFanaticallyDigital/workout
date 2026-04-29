"use client";

import { useTheme } from "@/providers/ThemeProvider";
import ThemedIcon from "@/components/themed/ThemedIcon";
import { fmtWeight } from "./util";
import type { MovementCat } from "./types";

interface SetCellProps {
  setIdx: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
  /** Last-week values for ghost-state preview. */
  ghost?: { weight: number | null; reps: number | null } | null;
  isActive: boolean;
  cat: MovementCat;
  /** When >= 5 cells in a lane, shrink typography so they still fit. */
  dense?: boolean;
  /** Disable tap (used for read-only past-week view). */
  disabled?: boolean;
  onTap: () => void;
}

/**
 * Tappable square cell for a single set within an exercise lane.
 *
 * Three visual states:
 *   - empty    — center dot, dashed-feel border, taps open SetSheet
 *   - ghost    — last-week's values rendered dim (when provided)
 *   - filled   — current weight × reps in display weight, themed check corner
 *
 * Per-chrome attestations (port of logger-app.jsx#SetCell lines 527–657):
 *   notebook  → cream paper-tile pocket, italic ghost text
 *   iron      → darker pocket vs brass-rimmed plate, inset highlight
 *   lab       → paper-white surface, 2px shadow
 *   arcade    → deep navy pocket with cyan inset rim, larger numerals
 *   blueprint → lighter navy on dark drawing card, white inset
 *   cyberpunk → deep midnight panel, cyan inner-glow
 *   graffiti  → concrete shade, dark drop-shadow
 *
 * The `dense` prop scales typography down so 5–6 sets still fit a
 * 360–390px-wide lane on a phone — mirrors the prototype's rule.
 *
 * Note: the prototype's bare-SVG check icon is replaced by ThemedIcon
 * `check` — gives each theme its native completion glyph (neon-line /
 * pixel / sketchy / stencil / marker / drafted / clinical).
 */
export default function SetCell({
  setIdx,
  weight,
  reps,
  rir,
  done,
  ghost,
  isActive,
  cat,
  dense = false,
  disabled = false,
  onTap,
}: SetCellProps) {
  const { chrome } = useTheme();
  const filled = done && weight != null;
  const showGhost = !filled && !!(ghost && ghost.weight != null);
  const palette = cellPalette(chrome);

  // Arcade gets a typography bump (its native sizes were undersized for legibility).
  const isArcade = chrome === "arcade";
  const wFontFilled = isArcade ? (dense ? 22 : 26) : dense ? 16 : 22;
  const rFontFilled = isArcade ? (dense ? 14 : 16) : dense ? 10 : 12;
  const wFontGhost = isArcade ? (dense ? 18 : 22) : dense ? 14 : 18;
  const rFontGhost = isArcade ? (dense ? 12 : 14) : dense ? 9 : 11;
  const ghostItalic = chrome === "notebook" ? "italic" : "normal";

  const rpe = rir != null ? 10 - rir : null;

  return (
    <button
      onClick={onTap}
      disabled={disabled}
      aria-label={
        filled
          ? `Set ${setIdx + 1}: ${weight} × ${reps}${disabled ? "" : ", edit"}`
          : `Set ${setIdx + 1}: empty${disabled ? "" : ", log set"}`
      }
      className="touch-target"
      style={{
        position: "relative",
        flex: 1,
        aspectRatio: dense ? "1 / 1" : "1 / 0.85",
        minHeight: dense ? 46 : 56,
        minWidth: 0,
        background: filled
          ? palette.filled
          : isActive
          ? "rgb(var(--ft-accent) / 0.22)"
          : palette.surface,
        border: `1px solid ${
          isActive
            ? "rgb(var(--ft-accent))"
            : filled
            ? "rgb(var(--ft-accent) / 0.6)"
            : "rgb(var(--ft-border) / 0.55)"
        }`,
        boxShadow: palette.shadow,
        borderRadius: chrome === "lab" ? 6 : chrome === "notebook" ? 4 : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: dense ? 1 : 2,
        overflow: "hidden",
        transition: "border-color .15s, background .15s",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {/* set number corner */}
      <span
        className="font-data"
        style={{
          position: "absolute",
          top: 2,
          left: 4,
          fontSize: dense ? 7 : 8,
          color: "rgb(var(--ft-text-tertiary))",
          letterSpacing: ".05em",
        }}
      >
        {setIdx + 1}
      </span>

      {/* themed check corner when filled */}
      {filled && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            right: 3,
            color: `rgb(var(--ft-${cat}))`,
            display: "inline-flex",
          }}
        >
          <ThemedIcon name="check" size={dense ? 9 : 11} />
        </span>
      )}

      {filled ? (
        <>
          <span
            className="font-data tabular-nums"
            style={{
              fontSize: wFontFilled,
              lineHeight: 1,
              color: "rgb(var(--ft-text-primary))",
              fontWeight: 700,
            }}
          >
            {fmtWeight(weight)}
          </span>
          <span
            className="font-data tabular-nums"
            style={{
              fontSize: rFontFilled,
              color: "rgb(var(--ft-text-tertiary))",
              marginTop: isArcade ? 2 : 1,
            }}
          >
            ×{reps}
            {!dense && rpe != null ? ` @${rpe}` : ""}
          </span>
        </>
      ) : showGhost && ghost ? (
        <>
          <span
            className="font-data tabular-nums"
            style={{
              fontSize: wFontGhost,
              lineHeight: 1,
              color: "rgb(var(--ft-text-tertiary) / 0.9)",
              fontWeight: 500,
              fontStyle: ghostItalic,
            }}
          >
            {fmtWeight(ghost.weight)}
          </span>
          <span
            className="font-data tabular-nums"
            style={{
              fontSize: rFontGhost,
              color: "rgb(var(--ft-text-tertiary) / 0.7)",
              marginTop: 1,
            }}
          >
            ×{ghost.reps}
          </span>
        </>
      ) : (
        <span
          style={{
            fontSize: 14,
            color: "rgb(var(--ft-text-tertiary) / 0.5)",
          }}
        >
          ·
        </span>
      )}
    </button>
  );
}

/** "Add set" trailing affordance shown after the last cell. */
export function AddSetCell({
  onTap,
  dense = false,
}: {
  onTap: () => void;
  dense?: boolean;
}) {
  const { chrome } = useTheme();
  const isNotebook = chrome === "notebook";
  return (
    <button
      onClick={onTap}
      aria-label="Add set"
      className="touch-target"
      style={{
        flex: 1,
        aspectRatio: dense ? "1 / 1" : "1 / 0.85",
        minHeight: dense ? 46 : 56,
        minWidth: 0,
        background: "transparent",
        border: "1px dashed rgb(var(--ft-border) / 0.7)",
        borderRadius: chrome === "lab" ? 6 : isNotebook ? 4 : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: dense ? 1 : 2,
        color: "rgb(var(--ft-text-tertiary))",
        cursor: "pointer",
        transition: "background .15s, color .15s, border-color .15s",
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 400 }}>+</span>
      <span
        className="font-data"
        style={{
          fontSize: 8,
          letterSpacing: ".12em",
          textTransform: isNotebook ? "lowercase" : "uppercase",
          opacity: 0.8,
          marginTop: 2,
        }}
      >
        {isNotebook ? "add" : "SET"}
      </span>
    </button>
  );
}

/**
 * Per-chrome cell surface palette — ported from logger-app.jsx#SetCell
 * (lines 556–582) with R0 token approximations. Each chrome picks a
 * tint that fits its own palette so cells read as a "step away" from
 * the surrounding lane card.
 */
function cellPalette(chrome: string): {
  surface: string;
  filled: string;
  shadow: string;
} {
  switch (chrome) {
    case "notebook":
      return {
        surface: "rgb(var(--ft-surface-raised))",
        filled: "rgb(var(--ft-accent) / 0.10)",
        shadow:
          "0 1px 0 rgb(0 0 0 / 0.05), inset 0 1px 0 rgb(255 255 255 / 0.5)",
      };
    case "iron":
      return {
        surface: "rgb(var(--ft-bg-alt))",
        filled: "rgb(var(--ft-accent) / 0.12)",
        shadow:
          "inset 0 1px 0 rgb(0 0 0 / 0.35), inset 0 -1px 0 rgb(255 255 255 / 0.04)",
      };
    case "lab":
      return {
        surface: "rgb(var(--ft-surface))",
        filled: "rgb(var(--ft-accent) / 0.08)",
        shadow: "0 1px 2px rgb(15 23 42 / 0.06)",
      };
    case "arcade":
      return {
        surface: "rgb(var(--ft-bg-alt))",
        filled: "rgb(var(--ft-accent) / 0.18)",
        shadow: "inset 0 0 0 1px rgb(var(--ft-info-fg) / 0.18)",
      };
    case "blueprint":
      return {
        surface: "rgb(var(--ft-surface-alt))",
        filled: "rgb(var(--ft-text-primary) / 0.16)",
        shadow: "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
      };
    case "cyberpunk":
      return {
        surface: "rgb(var(--ft-bg-alt))",
        filled: "rgb(var(--ft-accent) / 0.10)",
        shadow: "inset 0 0 12px rgb(var(--ft-accent) / 0.06)",
      };
    case "graffiti":
      return {
        surface: "rgb(var(--ft-bg-alt))",
        filled: "rgb(var(--ft-accent) / 0.14)",
        shadow: "0 1px 0 rgb(0 0 0 / 0.4)",
      };
    default:
      return {
        surface: "rgb(var(--ft-bg-alt))",
        filled: "rgb(var(--ft-accent) / 0.10)",
        shadow: "none",
      };
  }
}
