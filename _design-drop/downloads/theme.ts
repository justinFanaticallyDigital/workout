/**
 * Theme switching utility.
 *
 * Themes are CSS-variable overrides on `:root[data-theme="..."]`,
 * defined in globals.css. At runtime we just stamp the attribute
 * on `<html>` and the whole tree re-skins.
 *
 * Persistence: localStorage only. If you want cross-device sync,
 * add a `themePreference` field to the User model and POST to
 * `/api/me/theme` from `setTheme`.
 */

const THEME_KEY = "fittrack-theme";

export type ThemeId =
  | "default"
  | "iron"
  | "lab"
  | "notebook"
  | "arcade"
  | "blueprint"
  | "cyberpunk"
  | "graffiti";

export const THEMES: { id: ThemeId; label: string; blurb: string }[] = [
  { id: "default",   label: "Default",        blurb: "Stock dark — system fonts, neutral grays." },
  { id: "iron",      label: "Iron & Chalk",   blurb: "Warm dark, brass accent, stencil display." },
  { id: "lab",       label: "Lab Report",     blurb: "Clean light, clinical blue, IBM Plex." },
  { id: "notebook",  label: "Notebook",       blurb: "Cream paper, red margin, hand-drawn type." },
  { id: "arcade",    label: "Arcade",         blurb: "Pink/cyan neon, pixel font, CRT vibes." },
  { id: "blueprint", label: "Blueprint",      blurb: "Grid paper, navy cards, mono spec text." },
  { id: "cyberpunk", label: "Cyberpunk",      blurb: "Deep navy, cyan glow, Orbitron." },
  { id: "graffiti",  label: "Graffiti",       blurb: "Concrete bg, marker text, yellow tape." },
];

export function getTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(THEME_KEY) as ThemeId | null;
  return stored ?? "default";
}

export function setTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  if (theme === "default") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem(THEME_KEY);
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  // Notify listeners (in-page theme picker, charts that need re-color, etc.)
  window.dispatchEvent(new CustomEvent("fittrack-theme-change", { detail: theme }));
}

export function initTheme(): void {
  const theme = getTheme();
  if (theme !== "default") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

/** CSS var → rgb() string. Used by Recharts / canvas / inline SVG. */
export function getCssColor(token: string): string {
  if (typeof window === "undefined") return "#888888";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--ft-${token}`)
    .trim();
  if (!value) return "#888888";
  return `rgb(${value})`;
}

/** Theme-aware Recharts defaults. */
export function chartTheme() {
  return {
    tick: { fontSize: 10, fill: getCssColor("dim"), fontFamily: "var(--ft-font-data)" },
    axisLine: { stroke: getCssColor("border") },
    tooltipStyle: {
      backgroundColor: getCssColor("surface"),
      border: `1px solid ${getCssColor("border")}`,
      borderRadius: 4,
      fontFamily: "var(--ft-font-data)",
      fontSize: 12,
    },
    labelStyle: { color: getCssColor("light") },
    dot: { fill: getCssColor("white"), r: 3 },
    lineStroke: getCssColor("white"),
  };
}
