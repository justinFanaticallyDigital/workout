/**
 * Chart colour helpers. Reads the static `--ft-*` tokens from `:root`
 * (globals.css) so Recharts, which needs inline colour strings, matches the
 * rest of the UI. There is one theme; nothing here switches anything.
 */

/** Resolve a `--ft-<token>` RGB triplet (or raw colour) to a CSS colour string. */
export function getCssColor(token: string): string {
  if (typeof window === "undefined") return "#7A8782";
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--ft-${token}`).trim();
  if (!value) return "#7A8782";
  if (value.startsWith("#") || value.startsWith("rgb")) return value;
  return `rgb(${value})`;
}

/** Recharts defaults in the Atompunk palette. */
export function chartTheme() {
  return {
    tick: { fontSize: 10, fill: getCssColor("text-tertiary"), fontFamily: "var(--ft-font-data)" },
    axisLine: { stroke: getCssColor("border") },
    tooltipStyle: {
      backgroundColor: getCssColor("surface"),
      border: `1px solid ${getCssColor("border")}`,
      borderRadius: 10,
      fontFamily: "var(--ft-font-data)",
      fontSize: 12,
    },
    labelStyle: { color: getCssColor("text-secondary") },
    dot: { fill: getCssColor("accent"), r: 3 },
    lineStroke: getCssColor("accent"),
  };
}
