import { ThemeConfig } from './types';

/**
 * Iron & Chalk — values pulled from theme-bridge.jsx.
 * Notable changes: text moved from alpha-warm-white to solid #F5F0E6,
 * border tied to brass accent.
 */
export const iron: ThemeConfig = {
  id: 'iron',
  name: 'Iron & Chalk',
  chrome: 'iron',
  isDark: true,

  colors: {
    bg: '#161514',
    bgAlt: '#1E1D1B',
    bgCard: '#2E2D2B',
    surface: '#2E2D2B',
    surfaceAlt: '#3a3835',
    bgElevated: '#3C3A37',
    surfaceRaised: '#3C3A37',

    textPrimary: '#F5F0E6',
    text: '#F5F0E6',
    textSecondary: '#D7CDBE',
    textSec: '#D7CDBE',
    textTertiary: '#BAB1A1',
    textTer: '#BAB1A1',
    textOnAccent: '#161514',
    textOnBg: '#F5F0E6',
    textOnBgSec: '#D7CDBE',
    textOnBgTer: '#BAB1A1',

    border: 'rgba(200,169,110,0.25)',
    borderFaint: 'rgba(200,169,110,0.12)',
    borderSubtle: 'rgba(200,169,110,0.12)',
    borderStrong: 'rgba(200,169,110,0.55)',

    accent: '#C8A96E',
    accentSecondary: '#8B4513',
    accentFg: '#C8A96E',
    accentFaint: 'rgba(200,169,110,0.15)',
    accentBorder: 'rgba(200,169,110,0.4)',

    push: '#5BA0E0',
    pull: '#7AC97A',
    legs: '#E07268',
    core: '#E8B860',

    success: '#6EC882',
    successFg: '#82D791',
    successBg: 'rgba(110,200,130,0.10)',
    successBorder: 'rgba(110,200,130,0.35)',

    error: '#F05F55',
    danger: '#F05F55',
    dangerFg: '#F58278',
    dangerBg: 'rgba(240,95,85,0.10)',
    dangerBorder: 'rgba(240,95,85,0.40)',

    warning: '#F0BE5A',
    warn: '#F0BE5A',
    warnFg: '#F0C86E',
    warnBg: 'rgba(240,190,90,0.10)',
    warnBorder: 'rgba(240,190,90,0.35)',

    info: '#C8A96E',
    infoFg: '#C8A96E',
    infoBg: 'rgba(200,169,110,0.10)',
    infoBorder: 'rgba(200,169,110,0.4)',
  },

  fonts: {
    display: "'Stardos Stencil', serif",
    fontDisplay: "'Stardos Stencil', serif",
    data: "'Teko', sans-serif",
    fontData: "'Teko', sans-serif",
    body: "'Oswald', sans-serif",
    fontBody: "'Oswald', sans-serif",
    fontNumber: "'Teko', sans-serif",
  },

  borders: {
    card: '1px solid rgba(255,252,245,0.08)',
    divider: '1px solid rgba(255,252,245,0.06)',
    radius: '0',
  },

  radius: {
    sm: '0',
    md: '0',
    lg: '2px',
  },

  shadows: {
    sm: '0 1px 0 rgba(0,0,0,0.4)',
    md: '0 4px 12px rgba(0,0,0,0.5)',
  },

  stamp: {
    fg: '#C8A96E',
    bg: 'transparent',
    border: 'rgba(200,169,110,0.6)',
  },

  texture: {
    type: 'svg-inline',
    value: '<svg style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0"><defs><filter id="chalk-dust"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter></defs><rect width="100%" height="100%" filter="url(#chalk-dust)" fill="white"/></svg>',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#C8A96E',
        borderWidth: '2px',
      },
    },
    button: {
      style: 'outline',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
