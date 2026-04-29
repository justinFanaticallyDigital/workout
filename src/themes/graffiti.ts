import { ThemeConfig } from './types';

/**
 * Graffiti / 90s Street — values pulled from theme-bridge.jsx.
 * Major value changes from prior live: accent moved blue → yellow,
 * fontData moved Reenie Beanie/Caveat → Bungee, fontBody moved
 * Archivo Black → Permanent Marker.
 */
export const graffiti: ThemeConfig = {
  id: 'graffiti',
  name: '90s Street',
  chrome: 'graffiti',
  isDark: true,

  colors: {
    bg: '#1C1C1E',
    bgAlt: '#2A2A2D',
    bgCard: '#3A3A3E',
    surface: '#3A3A3E',
    surfaceAlt: '#2D2D30',
    bgElevated: '#48484C',
    surfaceRaised: '#48484C',

    textPrimary: '#FAFAF8',
    text: '#FAFAF8',
    textSecondary: '#D7D7DC',
    textSec: '#D7D7DC',
    textTertiary: '#C0C0C3',
    textTer: '#C0C0C3',
    textOnAccent: '#1C1C1E',
    textOnBg: '#FAFAF8',
    textOnBgSec: '#D7D7DC',
    textOnBgTer: '#C0C0C3',

    border: 'rgba(245,220,60,0.35)',
    borderFaint: 'rgba(255,255,255,0.10)',
    borderSubtle: 'rgba(255,255,255,0.10)',
    borderStrong: '#F5DC3C',

    accent: '#F5DC3C',
    accentSecondary: '#FDCA40',
    accentFg: '#F5DC3C',
    accentFaint: 'rgba(245,220,60,0.15)',
    accentBorder: 'rgba(245,220,60,0.5)',

    push: '#5C9CFA',
    pull: '#7DD17D',
    legs: '#FF7AA8',
    core: '#F5C275',

    success: '#5CB85C',
    successFg: '#7DD17D',
    successBg: 'rgba(92,184,92,0.12)',
    successBorder: 'rgba(92,184,92,0.4)',

    error: '#FF508C',
    danger: '#FF508C',
    dangerFg: '#FF7AA8',
    dangerBg: 'rgba(255,80,140,0.12)',
    dangerBorder: 'rgba(255,80,140,0.4)',

    warning: '#F0AD4E',
    warn: '#F0AD4E',
    warnFg: '#F5C275',
    warnBg: 'rgba(240,173,78,0.12)',
    warnBorder: 'rgba(240,173,78,0.4)',

    info: '#3B82F6',
    infoFg: '#5C9CFA',
    infoBg: 'rgba(59,130,246,0.12)',
    infoBorder: 'rgba(59,130,246,0.4)',
  },

  fonts: {
    display: "'Permanent Marker', cursive",
    fontDisplay: "'Permanent Marker', cursive",
    data: "'Bungee', sans-serif",
    fontData: "'Bungee', sans-serif",
    body: "'Permanent Marker', cursive",
    fontBody: "'Permanent Marker', cursive",
    fontNumber: "'Bungee', sans-serif",
  },

  borders: {
    card: '1px dashed rgba(255,255,255,0.12)',
    divider: '1px dashed rgba(255,255,255,0.10)',
    radius: '0',
  },

  radius: {
    sm: '0',
    md: '1px',
    lg: '2px',
  },

  shadows: {
    sm: '2px 2px 0 rgba(0,0,0,0.3)',
    md: '0 6px 18px rgba(0,0,0,0.4)',
  },

  stamp: {
    fg: '#1C1C1E',
    bg: '#F5DC3C',
    border: '#F5DC3C',
  },

  texture: {
    type: 'svg-inline',
    // Concrete fractal noise — preserved from prior live (not in theme-bridge.jsx).
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
