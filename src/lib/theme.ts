/**
 * Theme switching utility.
 *
 * Source of truth: per-theme TypeScript files in `src/themes/*.ts` define
 * `ThemeConfig` objects (texture, component overrides). Color/font/border
 * tokens are mirrored as CSS variables in `src/app/globals.css` under
 * `:root[data-theme="..."]` blocks. ThemeProvider stamps `data-theme` on
 * `<html>` and CSS does the rest.
 *
 * Persistence: localStorage only. To sync cross-device, add a
 * `themePreference` field to `User` and POST to `/api/me/theme` here.
 */

const THEME_KEY = 'fittrack-theme';

export type ThemeId =
  | 'default'
  | 'graffiti'
  | 'cyberpunk'
  | 'notebook'
  | 'blueprint'
  | 'arcade'
  | 'lab'
  | 'iron';

export const THEMES: { id: ThemeId; label: string; blurb: string }[] = [
  { id: 'default',   label: 'Default',        blurb: 'Stock dark — system fonts, neutral grays.' },
  { id: 'graffiti',  label: '90s Street',     blurb: 'Concrete bg, marker text, yellow tape.' },
  { id: 'cyberpunk', label: 'Dark Future',    blurb: 'Deep navy, cyan glow, Orbitron.' },
  { id: 'notebook',  label: "Coach's Notebook", blurb: 'Cream paper, red margin, hand-drawn type.' },
  { id: 'blueprint', label: 'Blueprint',      blurb: 'Grid paper, navy cards, mono spec text.' },
  { id: 'arcade',    label: 'Retro Arcade',   blurb: 'Pink/cyan neon, pixel font, CRT vibes.' },
  { id: 'lab',       label: 'Lab Report',     blurb: 'Clean light, clinical blue, IBM Plex.' },
  { id: 'iron',      label: 'Iron & Chalk',   blurb: 'Warm dark, brass accent, stencil display.' },
];

export function getTheme(): ThemeId {
  if (typeof window === 'undefined') return 'graffiti';
  const stored = localStorage.getItem(THEME_KEY) as ThemeId | null;
  return stored ?? 'graffiti';
}

export function setTheme(theme: ThemeId): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent('fittrack-theme-change', { detail: theme }));
}

export function initTheme(): void {
  if (typeof window === 'undefined') return;
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Helper to get a CSS variable value as a CSS rgb() string.
 * Useful for libraries like Recharts that need inline color strings.
 */
export function getCssColor(token: string): string {
  if (typeof window === 'undefined') return '#888888';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--ft-${token}`)
    .trim();
  if (!value) return '#888888';
  // If it's already an rgb/hex value, return as-is
  if (value.startsWith('#') || value.startsWith('rgb')) return value;
  // Otherwise treat as RGB triplet
  return `rgb(${value})`;
}

/** Theme-aware Recharts defaults. */
export function chartTheme() {
  return {
    tick: { fontSize: 10, fill: getCssColor('dim'), fontFamily: 'var(--ft-font-data)' },
    axisLine: { stroke: getCssColor('border') },
    tooltipStyle: {
      backgroundColor: getCssColor('surface'),
      border: `1px solid ${getCssColor('border')}`,
      borderRadius: 4,
      fontFamily: 'var(--ft-font-data)',
      fontSize: 12,
    },
    labelStyle: { color: getCssColor('light') },
    dot: { fill: getCssColor('white'), r: 3 },
    lineStroke: getCssColor('white'),
  };
}
