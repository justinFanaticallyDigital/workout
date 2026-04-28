"use client";

import { useEffect } from "react";
import { initTheme } from "@/lib/theme";

/**
 * Mounted in app/layout.tsx. Reads the stored theme on first paint
 * and stamps `data-theme` on <html> before user content renders.
 *
 * Note: there's a one-frame flash of default theme before this runs.
 * If that bothers you, inline a small <script> in layout.tsx <head>
 * that reads localStorage and sets the attribute synchronously —
 * `dangerouslySetInnerHTML` with the matching key. Optional.
 */
export default function ThemeInit() {
  useEffect(() => {
    initTheme();
  }, []);
  return null;
}
