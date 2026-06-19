'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, ThemeConfig } from '@/themes';
import ThemePickerModal from '@/components/themed/ThemePickerModal';

interface ThemeContextType {
  themeId: string;
  theme: ThemeConfig;
  /** Theme-bridge `chrome` discriminator (e.g. 'iron'). Convenience read. */
  chrome: string;
  /** True when active theme is dark. Convenience read. */
  isDark: boolean;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'fittrack-theme';
const THEME_CHOSEN_KEY = 'fittrack-theme-chosen';

/**
 * Parse a CSS color string to RGB triplet (e.g. "42 45 47") for use
 * in `rgb(var(--ft-x) / <alpha-value>)` Tailwind classes. Supports
 * `#rrggbb`, `#rgb`, `rgb()`, and `rgba()`.
 */
function colorToRgbTriplet(color: string): string {
  const rgbaMatch = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) return `${rgbaMatch[1]} ${rgbaMatch[2]} ${rgbaMatch[3]}`;
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Stamps `data-theme` and `data-button-style` on <html>. */
function applyThemeAttributes(theme: ThemeConfig) {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.dataset.buttonStyle = theme.components.button.style;
}

/**
 * Writes every prototype-shape CSS var to `:root` so themed React
 * components and Tailwind classes resolve correctly. Static
 * `:root[data-theme="X"]` blocks in globals.css already cover the core
 * tokens; this is the runtime fallback for tokens that haven't yet
 * been backfilled there or that are only known at runtime.
 *
 * Every new color/font/radius/shadow slot from ThemeConfig is written.
 */
function writeRuntimeCssVars(theme: ThemeConfig) {
  const root = document.documentElement;
  const c = theme.colors;
  const set = (name: string, value: string) => root.style.setProperty(name, value);
  const setRgb = (name: string, value: string) => set(name, colorToRgbTriplet(value));

  // Background hierarchy
  setRgb('--ft-bg', c.bg);
  setRgb('--ft-bg-alt', c.bgAlt);
  setRgb('--ft-surface', c.surface);
  setRgb('--ft-surface-alt', c.surfaceAlt);
  setRgb('--ft-card', c.bgElevated); // legacy alias
  setRgb('--ft-surface-raised', c.surfaceRaised);

  // Text
  setRgb('--ft-text-primary', c.text);
  setRgb('--ft-text-secondary', c.textSec);
  setRgb('--ft-text-tertiary', c.textTer);
  setRgb('--ft-text-on-accent', c.textOnAccent);
  setRgb('--ft-text-on-bg', c.textOnBg);
  setRgb('--ft-text-on-bg-sec', c.textOnBgSec);
  setRgb('--ft-text-on-bg-ter', c.textOnBgTer);

  // Legacy grayscale hierarchy aliases
  setRgb('--ft-white', c.text);
  setRgb('--ft-pale', c.text);
  setRgb('--ft-light', c.textSec);
  setRgb('--ft-dim', c.textTer);
  setRgb('--ft-muted', c.textTer);

  // Borders
  setRgb('--ft-border', c.border);
  setRgb('--ft-border-faint', c.borderFaint);
  setRgb('--ft-border-strong', c.borderStrong);
  set('--ft-border-color', c.border);
  set('--ft-border-subtle-color', c.borderSubtle);

  // Accent family
  setRgb('--ft-accent', c.accent);
  setRgb('--ft-accent-secondary', c.accentSecondary);
  setRgb('--ft-accent-fg', c.accentFg);
  setRgb('--ft-accent-faint', c.accentFaint);
  setRgb('--ft-accent-border', c.accentBorder);
  // On-bg accent family (Blueprint-safe — see ARCHITECTURE.md §1)
  setRgb('--ft-accent-on-bg', c.accentOnBg);
  setRgb('--ft-accent-faint-on-bg', c.accentFaintOnBg);
  setRgb('--ft-accent-border-on-bg', c.accentBorderOnBg);

  // Movement
  setRgb('--ft-push', c.push);
  setRgb('--ft-pull', c.pull);
  setRgb('--ft-legs', c.legs);
  setRgb('--ft-core', c.core);

  // State families
  setRgb('--ft-success', c.success);
  setRgb('--ft-success-fg', c.successFg);
  setRgb('--ft-success-bg', c.successBg);
  setRgb('--ft-success-border', c.successBorder);
  setRgb('--ft-success-br', c.successBorder); // legacy alias

  setRgb('--ft-warn', c.warn);
  setRgb('--ft-warn-fg', c.warnFg);
  setRgb('--ft-warn-bg', c.warnBg);
  setRgb('--ft-warn-border', c.warnBorder);
  setRgb('--ft-warn-br', c.warnBorder); // legacy alias

  setRgb('--ft-danger', c.danger);
  setRgb('--ft-danger-fg', c.dangerFg);
  setRgb('--ft-danger-bg', c.dangerBg);
  setRgb('--ft-danger-border', c.dangerBorder);
  setRgb('--ft-danger-br', c.dangerBorder); // legacy alias

  setRgb('--ft-info', c.info);
  setRgb('--ft-info-fg', c.infoFg);
  setRgb('--ft-info-bg', c.infoBg);
  setRgb('--ft-info-border', c.infoBorder);
  setRgb('--ft-info-br', c.infoBorder); // legacy alias

  // Fonts
  set('--ft-font-display', theme.fonts.fontDisplay);
  set('--ft-font-data', theme.fonts.fontData);
  set('--ft-font-handwritten', theme.fonts.fontData);
  set('--ft-font-body', theme.fonts.fontBody);
  set('--ft-font-number', theme.fonts.fontNumber);
  set('--ft-font-sans', theme.fonts.fontBody);

  // Borders, radius, shadows
  set('--ft-border-card', theme.borders.card);
  set('--ft-border-divider', theme.borders.divider);
  set('--ft-border-radius', theme.borders.radius);
  set('--ft-radius', theme.borders.radius);
  set('--ft-radius-sm', theme.radius.sm);
  set('--ft-radius-md', theme.radius.md);
  set('--ft-radius-lg', theme.radius.lg);
  set('--ft-shadow-sm', theme.shadows.sm);
  set('--ft-shadow-md', theme.shadows.md);

  // Stamp
  set('--ft-stamp-fg', theme.stamp.fg);
  set('--ft-stamp-bg', theme.stamp.bg);
  set('--ft-stamp-border', theme.stamp.border);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('graffiti');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && themes[saved]) {
      setThemeId(saved);
    }
    if (!localStorage.getItem(THEME_CHOSEN_KEY)) {
      setShowPicker(true);
    }
  }, []);

  useEffect(() => {
    const t = themes[themeId];
    applyThemeAttributes(t);
    writeRuntimeCssVars(t);
  }, [themeId]);

  // Listen for non-component-driven theme changes (lib/theme.ts setTheme).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && themes[detail] && detail !== themeId) {
        setThemeId(detail);
      }
    };
    window.addEventListener('fittrack-theme-change', handler);
    return () => window.removeEventListener('fittrack-theme-change', handler);
  }, [themeId]);

  const setTheme = (id: string) => {
    if (!themes[id]) return;
    setThemeId(id);
    localStorage.setItem(THEME_KEY, id);
    localStorage.setItem(THEME_CHOSEN_KEY, '1');
  };

  const theme = themes[themeId];

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        chrome: theme.chrome,
        isDark: theme.isDark,
        setTheme,
      }}
    >
      {children}
      {showPicker && (
        <ThemePickerModal
          onClose={() => {
            localStorage.setItem(THEME_CHOSEN_KEY, '1');
            setShowPicker(false);
          }}
        />
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
