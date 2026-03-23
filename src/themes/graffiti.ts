import { ThemeConfig } from './types';

export const graffiti: ThemeConfig = {
  id: 'graffiti',
  name: '90s Street',

  colors: {
    // Background: dark charcoal concrete
    bg: '#2A2D2F',
    bgCard: '#323638',
    bgElevated: '#3A3E40',

    // Text: light on dark — white/gray spectrum
    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.55)',
    textTertiary: 'rgba(255,255,255,0.3)',

    // Accent: movement colors serve as accents — defaults to Push blue
    accent: '#3B82F6',
    accentSecondary: '#FDCA40',   // golden yellow for CTAs

    // Movement colors (invariant)
    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    // State
    success: '#22C55E',
    error: '#EF4444',
    warning: '#EAB308',

    // Borders
    border: 'rgba(255,255,255,0.12)',
    borderSubtle: 'rgba(255,255,255,0.06)',
  },

  fonts: {
    display: "'Permanent Marker', cursive",
    data: "'Caveat', cursive",
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px dashed rgba(255,255,255,0.12)',
    divider: '1px dashed rgba(255,255,255,0.10)',
    radius: '0',  // sharp corners — concrete doesn't have rounded edges
  },

  texture: {
    type: 'svg-inline',
    // Two-layer SVG fractal noise: fine grain (0.65) + coarse grain (0.15)
    value: `<svg style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0"><defs><filter id="concrete-fine"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" seed="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.08"/></feComponentTransfer></filter><filter id="concrete-coarse"><feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" stitchTiles="stitch" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.04"/></feComponentTransfer></filter></defs><rect width="100%" height="100%" filter="url(#concrete-fine)" fill="white"/><rect width="100%" height="100%" filter="url(#concrete-coarse)" fill="white"/></svg>`,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        type: 'spray-underline',
        height: '3px',
        opacity: '0.6',
      },
    },
    button: {
      style: 'underline',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
