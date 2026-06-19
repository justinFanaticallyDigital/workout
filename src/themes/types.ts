/**
 * ThemeConfig — extended to match design-prototypes/theme-bridge.jsx contract.
 *
 * Every prototype token name is available, either as a direct field or as
 * an alias of an existing live name. New fields populate the missing slots
 * (state-fg/bg/border, accent-fg/faint/border, surface-alt/raised, etc.).
 *
 * Naming strategy: existing nested groups (`colors`, `fonts`, `borders`,
 * `texture`, `components`) are preserved so every existing callsite reading
 * `theme.colors.bgCard`, `theme.fonts.display`, etc. continues to work.
 * Prototype-shape names are added as additional keys inside those groups,
 * plus three new groups (`radius`, `shadows`, `stamp`) and two top-level
 * fields (`chrome`, `isDark`).
 */
export interface ThemeConfig {
  id: string;
  name: string;

  /** Theme-bridge `chrome` discriminator (e.g. 'iron', 'lab'). Aliases `id`. */
  chrome: string;

  /** True when the theme's primary surface tone is dark. */
  isDark: boolean;

  // === COLORS ===
  colors: {
    // Background hierarchy
    bg: string;
    bgAlt: string;            // intermediate tone between bg and surface
    bgCard: string;           // legacy alias of `surface`
    surface: string;          // primary card surface (theme-bridge)
    surfaceAlt: string;       // sub-surface (e.g. set cell tile)
    bgElevated: string;       // legacy alias of `surfaceRaised`
    surfaceRaised: string;    // raised surface (modals, popovers)

    // Text hierarchy
    textPrimary: string;
    text: string;             // alias of textPrimary
    textSecondary: string;
    textSec: string;          // alias of textSecondary
    textTertiary: string;
    textTer: string;          // alias of textTertiary
    textOnAccent: string;     // foreground on accent fill
    textOnBg: string;         // foreground when rendered directly on page bg
    textOnBgSec: string;
    textOnBgTer: string;

    // Borders
    border: string;
    borderFaint: string;      // alias of borderSubtle
    borderSubtle: string;     // legacy alias of borderFaint
    borderStrong: string;

    // Accents
    accent: string;
    accentSecondary: string;
    accentFg: string;         // accent as text color
    accentFaint: string;      // accent as background tint
    accentBorder: string;     // accent as border color

    // On-bg accent family — accent rendered DIRECTLY on the page bg.
    // Identical to accent/accentFaint/accentBorder for every theme EXCEPT
    // blueprint (inverted): there the normal accent is white → invisible on
    // the light page bg, so these flip to a dark, visible navy. Mandatory per
    // ARCHITECTURE.md §1 ("Never put bare accent-colored chrome on the page bg").
    accentOnBg: string;
    accentFaintOnBg: string;
    accentBorderOnBg: string;

    // Movement (constant across themes — but stored per theme for completeness)
    push: string;
    pull: string;
    legs: string;
    core: string;

    // State — base color + Fg/Bg/Border for each
    success: string;
    successFg: string;
    successBg: string;
    successBorder: string;

    error: string;            // legacy alias of `danger`
    danger: string;
    dangerFg: string;
    dangerBg: string;
    dangerBorder: string;

    warning: string;          // legacy alias of `warn`
    warn: string;
    warnFg: string;
    warnBg: string;
    warnBorder: string;

    info: string;
    infoFg: string;
    infoBg: string;
    infoBorder: string;
  };

  // === TYPOGRAPHY ===
  fonts: {
    display: string;
    fontDisplay: string;      // alias of `display`
    data: string;
    fontData: string;         // alias of `data`
    body: string;
    fontBody: string;         // alias of `body`
    /** Distinct font for big numerals (e.g. graffiti uses Bungee, others may match `data`). */
    fontNumber: string;
  };

  // === BORDERS (existing) ===
  borders: {
    card: string;
    divider: string;
    radius: string;           // legacy single-value radius (== radius.md)
  };

  // === RADIUS (NEW) ===
  radius: {
    sm: string;
    md: string;
    lg: string;
  };

  // === SHADOWS (NEW) ===
  shadows: {
    sm: string;
    md: string;
  };

  // === STAMP (NEW — for the .ft-stamp pill element) ===
  stamp: {
    fg: string;
    bg: string;
    border: string;
  };

  // === THEME-SPECIFIC TEXTURE ===
  texture: {
    type: 'css' | 'svg' | 'svg-inline' | 'none';
    value: string;
  };

  // === COMPONENT OVERRIDES (existing) ===
  components: {
    exerciseCard: {
      movementIndicator: 'left-bar' | 'top-bar' | 'border';
      movementIndicatorWidth?: string;
    };
    nav: {
      activeIndicator: 'underline' | 'glow-dot' | 'bg-fill' | 'border-bottom';
      activeStyle?: Record<string, string>;
    };
    button: {
      style: 'underline' | 'outline' | 'ghost' | 'pixel-border' | 'fill';
    };
    restTimer: {
      style: 'bar' | 'radial' | 'text-countdown';
      glowEffect?: boolean;
    };
  };
}
