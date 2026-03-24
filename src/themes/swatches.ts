import { themes } from './index';

/** Derived theme swatches for pickers/previews — always in sync with theme configs. */
export const THEME_SWATCHES: Record<string, { bg: string; accent: string; text: string }> = Object.fromEntries(
  Object.entries(themes).map(([id, t]) => [
    id,
    { bg: t.colors.bg, accent: t.colors.accent, text: t.colors.textPrimary },
  ])
);
