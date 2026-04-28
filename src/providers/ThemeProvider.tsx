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
const THEME_CHOSEN_KEY = 'fittrack-theme-chosen';

/**
 * Stamp `data-theme` and `data-button-style` on <html>. CSS owns
 * all token values via `:root[data-theme="X"]` blocks in globals.css —
 * this provider just toggles which block is active and exposes the
 * theme's TS config (texture, component overrides) to themed React
 * components via `useTheme()`.
 */
function applyThemeAttributes(theme: ThemeConfig) {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.dataset.buttonStyle = theme.components.button.style;
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
    applyThemeAttributes(themes[themeId]);
  }, [themeId]);

  // Listen for theme changes dispatched from lib/theme.ts setTheme()
  // (e.g. from non-component code). Keeps context in sync.
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
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
      {showPicker && <ThemePickerModal onClose={() => {
        localStorage.setItem(THEME_CHOSEN_KEY, '1');
        setShowPicker(false);
      }} />}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
