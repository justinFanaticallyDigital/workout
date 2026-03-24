/**
 * Theme switching utility.
 * Backward-compatible with the CSS custom property system.
 * The new ThemeProvider (src/providers/ThemeProvider.tsx) handles
 * applying theme configs as CSS variables. This file provides
 * utility functions for reading those CSS values at runtime.
 */

const THEME_KEY = "fittrack-theme";

export function getTheme(): string {
  if (typeof window === "undefined") return "graffiti";
  return localStorage.getItem(THEME_KEY) ?? "graffiti";
}

export function setTheme(theme: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Helper to get a CSS variable value as a CSS rgb() string.
 * Useful for libraries like Recharts that need inline color strings.
 */
export function getCssColor(token: string): string {
  if (typeof window === "undefined") return "#888888";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--ft-${token}`)
    .trim();
  if (!value) return "#888888";
  // If it's already an rgb/hex value, return as-is
  if (value.startsWith('#') || value.startsWith('rgb')) return value;
  // Otherwise treat as RGB triplet
  return `rgb(${value})`;
}

/** Chart theme constants — call these from client components to get theme-aware colors */
export function chartTheme() {
  return {
    tick: { fontSize: 10, fill: getCssColor("dim"), fontFamily: "var(--ft-font-body)" },
    axisLine: { stroke: getCssColor("border") },
    tooltipStyle: {
      backgroundColor: getCssColor("surface"),
      border: `1px solid ${getCssColor("border")}`,
      borderRadius: 4,
      fontFamily: "var(--ft-font-body)",
      fontSize: 12,
    },
    labelStyle: { color: getCssColor("light") },
    dot: { fill: getCssColor("white"), r: 3 },
    lineStroke: getCssColor("white"),
  };
}
