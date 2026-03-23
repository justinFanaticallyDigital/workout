'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, ThemeConfig } from '@/themes';
import ThemePickerModal from '@/components/themed/ThemePickerModal';

interface ThemeContextType {
  themeId: string;
  theme: ThemeConfig;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'fittrack-theme';

/**
 * Parse a CSS color string to RGB triplet string (e.g. "42 45 47").
 * Supports hex (#rrggbb, #rgb) and rgba().
 */
function colorToRgbTriplet(color: string): string {
  // Handle rgba() format — extract the RGB part
  const rgbaMatch = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `${rgbaMatch[1]} ${rgbaMatch[2]} ${rgbaMatch[3]}`;
  }

  // Handle hex
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Parse a text color with alpha to extract the alpha value.
 * Returns alpha as a number, or 1 if no alpha found.
 */
function extractAlpha(color: string): number {
  const match = color.match(/rgba?\([^)]*[\s,/]\s*([\d.]+)\s*\)/);
  if (match) return parseFloat(match[1]);
  return 1;
}

function applyThemeCssVars(theme: ThemeConfig) {
  const root = document.documentElement;
  const c = theme.colors;

  // Background & surface colors
  root.style.setProperty('--ft-bg', colorToRgbTriplet(c.bg));
  root.style.setProperty('--ft-surface', colorToRgbTriplet(c.bgCard));
  root.style.setProperty('--ft-card', colorToRgbTriplet(c.bgElevated));
  root.style.setProperty('--ft-border', colorToRgbTriplet(c.border));
  root.style.setProperty('--ft-accent', colorToRgbTriplet(c.accent));
  root.style.setProperty('--ft-accent-secondary', colorToRgbTriplet(c.accentSecondary));

  // State colors
  root.style.setProperty('--ft-success', colorToRgbTriplet(c.success));
  root.style.setProperty('--ft-warn', colorToRgbTriplet(c.warning));
  root.style.setProperty('--ft-danger', colorToRgbTriplet(c.error));

  // Movement colors (constant but included for completeness)
  root.style.setProperty('--ft-push', colorToRgbTriplet(c.push));
  root.style.setProperty('--ft-pull', colorToRgbTriplet(c.pull));
  root.style.setProperty('--ft-legs', colorToRgbTriplet(c.legs));
  root.style.setProperty('--ft-core', colorToRgbTriplet(c.core));

  // Text colors — extract RGB and alpha separately
  root.style.setProperty('--ft-text-primary', colorToRgbTriplet(c.textPrimary));
  root.style.setProperty('--ft-text-secondary', colorToRgbTriplet(c.textSecondary));
  root.style.setProperty('--ft-text-tertiary', colorToRgbTriplet(c.textTertiary));
  root.style.setProperty('--ft-alpha-primary', String(extractAlpha(c.textPrimary)));
  root.style.setProperty('--ft-alpha-secondary', String(extractAlpha(c.textSecondary)));
  root.style.setProperty('--ft-alpha-tertiary', String(extractAlpha(c.textTertiary)));

  // Border subtle — map to muted token
  root.style.setProperty('--ft-muted', colorToRgbTriplet(c.borderSubtle));

  // Backward-compat grayscale tokens used by Tailwind (ft-dim, ft-light, ft-pale, ft-white)
  // For dark themes these are white with varying alpha; for light themes, dark text shades
  root.style.setProperty('--ft-dim', colorToRgbTriplet(c.textTertiary));
  root.style.setProperty('--ft-light', colorToRgbTriplet(c.textSecondary));
  root.style.setProperty('--ft-pale', colorToRgbTriplet(c.textPrimary));
  root.style.setProperty('--ft-white', colorToRgbTriplet(c.textPrimary));

  // Border & divider CSS shorthands for direct use in components
  root.style.setProperty('--ft-border-card', theme.borders.card);
  root.style.setProperty('--ft-border-divider', theme.borders.divider);

  // Typography
  root.style.setProperty('--ft-font-display', theme.fonts.display);
  root.style.setProperty('--ft-font-handwritten', theme.fonts.data);
  root.style.setProperty('--ft-font-body', theme.fonts.body);
  root.style.setProperty('--ft-font-sans', theme.fonts.body);

  // Border radius
  root.style.setProperty('--ft-border-radius', theme.borders.radius);

  // Store theme-specific CSS vars for components
  root.style.setProperty('--bg', c.bg);
  root.style.setProperty('--bg-card', c.bgCard);
  root.style.setProperty('--bg-elevated', c.bgElevated);
  root.style.setProperty('--text-primary', c.textPrimary);
  root.style.setProperty('--text-secondary', c.textSecondary);
  root.style.setProperty('--text-tertiary', c.textTertiary);
  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--accent-secondary', c.accentSecondary);
  root.style.setProperty('--color-push', c.push);
  root.style.setProperty('--color-pull', c.pull);
  root.style.setProperty('--color-legs', c.legs);
  root.style.setProperty('--color-core', c.core);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--border-subtle', c.borderSubtle);
  root.style.setProperty('--font-display', theme.fonts.display);
  root.style.setProperty('--font-data', theme.fonts.data);
  root.style.setProperty('--font-body', theme.fonts.body);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('graffiti');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && themes[saved]) {
      setThemeId(saved);
    }
    // Show theme picker on first visit (no theme chosen yet)
    const hasChosen = localStorage.getItem('fittrack-theme-chosen');
    if (!hasChosen) {
      setShowPicker(true);
    }
  }, []);

  useEffect(() => {
    applyThemeCssVars(themes[themeId]);
  }, [themeId]);

  const setTheme = (id: string) => {
    if (!themes[id]) return;
    setThemeId(id);
    localStorage.setItem(THEME_KEY, id);
  };

  const theme = themes[themeId];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
      {showPicker && <ThemePickerModal onClose={() => setShowPicker(false)} />}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
