import { ThemeConfig } from './types';

/**
 * Notebook / Coach's Notebook — values pulled from theme-bridge.jsx.
 * Major change: bg moved from "desk" #E2D9C9 to paper #FAF6ED. Live
 * had treated the notebook as an object on a desk; the prototype
 * treats the user as writing directly on the page.
 */
export const notebook: ThemeConfig = {
  id: 'notebook',
  name: "Coach's Notebook",
  chrome: 'notebook',
  isDark: false,

  colors: {
    bg: '#FAF6ED',
    bgAlt: '#F0EBDD',
    bgCard: '#FFFCF4',
    surface: '#FFFCF4',
    surfaceAlt: '#FAF6ED',
    bgElevated: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    textPrimary: '#262119',
    text: '#262119',
    textSecondary: '#5A4F40',
    textSec: '#5A4F40',
    textTertiary: '#6E5F4A',
    textTer: '#6E5F4A',
    textOnAccent: '#FFFCF4',
    textOnBg: '#262119',
    textOnBgSec: '#5A4F40',
    textOnBgTer: '#6E5F4A',

    border: '#D2C6B2',
    borderFaint: '#E5DBCB',
    borderSubtle: '#E5DBCB',
    borderStrong: '#A89B85',

    accent: '#B5312A',
    accentSecondary: '#1A6B3C',
    accentFg: '#B5312A',
    accentFaint: 'rgba(181,49,42,0.10)',
    accentBorder: 'rgba(181,49,42,0.35)',

    push: '#5A85C7',
    pull: '#6BAA64',
    legs: '#C25A4F',
    core: '#D49A48',

    success: '#407A3C',
    successFg: '#407A3C',
    successBg: '#E6F0D7',
    successBorder: '#B4CD91',

    error: '#B5312A',
    danger: '#B5312A',
    dangerFg: '#B5312A',
    dangerBg: '#F5DCD5',
    dangerBorder: '#D29182',

    warning: '#AA5F14',
    warn: '#AA5F14',
    warnFg: '#AA5F14',
    warnBg: '#F6E8C8',
    warnBorder: '#D2AF6E',

    info: '#325582',
    infoFg: '#325582',
    infoBg: '#DCE6F0',
    infoBorder: '#AABED2',
  },

  fonts: {
    display: "'Caveat', cursive",
    fontDisplay: "'Caveat', cursive",
    data: "'Caveat', cursive",
    fontData: "'Caveat', cursive",
    body: "'Patrick Hand', cursive",
    fontBody: "'Patrick Hand', cursive",
    fontNumber: "'Caveat', cursive",
  },

  borders: {
    card: 'none',
    divider: '1px solid #D2C6B2',
    radius: '2px',
  },

  radius: {
    sm: '2px',
    md: '2px',
    lg: '3px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.08)',
    md: '0 4px 10px rgba(0,0,0,0.1)',
  },

  stamp: {
    fg: '#8C7D69',
    bg: 'transparent',
    border: '#D2C6B2',
  },

  texture: {
    type: 'css',
    value: `
      background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(100,140,180,0.15) 27px, rgba(100,140,180,0.15) 28px);
      background-position: 0 80px;
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#B5312A',
        borderWidth: '2px',
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
