"use client";

/**
 * Picker chrome predicates + tilt guard helpers.
 * Mirrors theme-typography.jsx#stripTilt + isPickerXxx predicates from
 * picker-screens.jsx, but binds to the live R0 ThemeProvider chrome
 * discriminator instead of the prototype's mutable IRON variable.
 */

import { useTheme } from "@/providers/ThemeProvider";
import type { CSSProperties } from "react";

export type PickerChrome =
  | "iron"
  | "lab"
  | "notebook"
  | "arcade"
  | "blueprint"
  | "cyberpunk"
  | "graffiti";

/** Returns true when the active theme is graffiti — the only chrome
 *  where slanted hand-drawn type reads correctly. Every other chrome
 *  wants level baselines, so {@link stripTilt} drops `transform` /
 *  `transformOrigin` from styles. */
export function useIsGraffiti(): boolean {
  const { chrome } = useTheme();
  return chrome === "graffiti";
}

/** Drops `transform` + `transformOrigin` from `style` on non-graffiti
 *  chromes. Verbatim port of theme-typography.jsx#stripTilt. */
export function stripTilt(
  style: CSSProperties | undefined,
  isGraffiti: boolean,
): CSSProperties | undefined {
  if (isGraffiti || !style) return style;
  const { transform: _t, transformOrigin: _to, ...rest } = style;
  void _t;
  void _to;
  return rest;
}
