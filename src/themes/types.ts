export interface ThemeConfig {
  id: string;
  name: string;

  // === COLORS ===
  colors: {
    // Background
    bg: string;              // main app background
    bgCard: string;          // card/container surface
    bgElevated: string;      // elevated surfaces (modals, popovers)

    // Text — these are the ONLY colors allowed for text content
    textPrimary: string;     // highest contrast text (exercise names, set data)
    textSecondary: string;   // medium contrast (labels, metadata)
    textTertiary: string;    // lowest contrast (hints, inactive)

    // Accents — STRUCTURAL ONLY, never used as text color
    accent: string;          // theme's primary accent
    accentSecondary: string; // secondary accent (if theme has one)

    // Movement colors (CONSTANT across all themes)
    push: string;   // #3B82F6
    pull: string;   // #22C55E
    legs: string;   // #EF4444
    core: string;   // #EAB308

    // State
    success: string;
    error: string;
    warning: string;

    // Borders & dividers
    border: string;
    borderSubtle: string;
  };

  // === TYPOGRAPHY ===
  fonts: {
    display: string;     // headers, titles, exercise names
    data: string;        // user-entered values (weights, reps, RIR)
    body: string;        // labels, metadata, nav items
  };

  // === BORDERS ===
  borders: {
    card: string;        // CSS border shorthand for cards
    divider: string;     // CSS border shorthand for dividers
    radius: string;      // border-radius for cards ('0' for sharp themes)
  };

  // === THEME-SPECIFIC TEXTURE ===
  texture: {
    type: 'css' | 'svg' | 'svg-inline' | 'none';
    value: string;  // CSS background property, SVG background URL, raw SVG markup, or empty
  };

  // === COMPONENT OVERRIDES ===
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
