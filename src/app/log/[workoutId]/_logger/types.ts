/**
 * Shared types for the lane-based logger UX.
 *
 * Mirrors the prototype's session shape (`design-prototypes/logger-app.jsx`)
 * but adapted to the live app's per-workout architecture. The existing
 * `ExerciseData` / `SetData` from `page.tsx` stay as the source of truth;
 * these types just describe handler signatures for the lane components.
 */

export interface ActiveCell {
  exerciseIdx: number;
  setIdx: number;
}

/** Color key used by the cell's check-corner glyph. */
export type MovementCat = "push" | "pull" | "legs" | "core";

export function movementCat(pattern: string | null | undefined): MovementCat {
  switch (pattern) {
    case "push":
      return "push";
    case "pull":
      return "pull";
    case "legs":
      return "legs";
    default:
      return "core";
  }
}
