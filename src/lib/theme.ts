/**
 * Theme switching utility.
 * Themes are defined as CSS custom property overrides on [data-theme] selectors.
 * The default theme (no data-theme attribute) uses :root values from globals.css.
 */

const THEME_KEY = "fittrack-theme";

export function getTheme(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(THEME_KEY) ?? "default";
}

export function setTheme(theme: string): void {
  if (typeof window === "undefined") return;
  if (theme === "default") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem(THEME_KEY);
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }
}

export function initTheme(): void {
  const theme = getTheme();
  if (theme !== "default") {
    document.documentElement.setAttribute("data-theme", theme);
  }
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
