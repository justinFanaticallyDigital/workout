import { ThemeConfig } from './types';

/**
 * Lab Report — values pulled from theme-bridge.jsx.
 * Notable changes: text darkened (#1A1A1A → #121823), textSec/Ter
 * align to clinical grays, success/warn/danger move to darker shades
 * for AA on light surfaces.
 */
export const lab: ThemeConfig = {
  id: 'lab',
  name: 'Lab Report',
  chrome: 'lab',
  isDark: false,

  colors: {
    bg: '#ECEDF0',
    bgAlt: '#F8F9FB',
    bgCard: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F8F9FB',
    bgElevated: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    textPrimary: '#121823',
    text: '#121823',
    textSecondary: '#3A4254',
    textSec: '#3A4254',
    textTertiary: '#5A6473',
    textTer: '#5A6473',
    textOnAccent: '#FFFFFF',
    textOnBg: '#121823',
    textOnBgSec: '#3A4254',
    textOnBgTer: '#5A6473',

    border: '#D2D6DC',
    borderFaint: '#E5E7EB',
    borderSubtle: '#E5E7EB',
    borderStrong: '#9CA3AF',

    accent: '#2563EB',
    accentSecondary: '#059669',
    accentFg: '#2563EB',
    accentFaint: '#EFF4FE',
    accentBorder: '#C7D7FB',
    accentOnBg: '#2563EB',
    accentFaintOnBg: '#EFF4FE',
    accentBorderOnBg: '#C7D7FB',

    push: '#4A90D9',
    pull: '#5CB85C',
    legs: '#D9534F',
    core: '#F0AD4E',

    success: '#15803D',
    successFg: '#15803D',
    successBg: '#ECFDF3',
    successBorder: '#A7E0BC',

    error: '#B42318',
    danger: '#B42318',
    dangerFg: '#B42318',
    dangerBg: '#FEF1F0',
    dangerBorder: '#F5B5AE',

    warning: '#C77405',
    warn: '#C77405',
    warnFg: '#C77405',
    warnBg: '#FFF6E5',
    warnBorder: '#F4D69A',

    info: '#2563EB',
    infoFg: '#2563EB',
    infoBg: '#EFF4FE',
    infoBorder: '#C7D7FB',
  },

  fonts: {
    display: "'IBM Plex Sans', sans-serif",
    fontDisplay: "'IBM Plex Sans', sans-serif",
    data: "'JetBrains Mono', monospace",
    fontData: "'JetBrains Mono', monospace",
    body: "'IBM Plex Sans', sans-serif",
    fontBody: "'IBM Plex Sans', sans-serif",
    fontNumber: "'JetBrains Mono', monospace",
  },

  borders: {
    card: '1px solid #E5E7EB',
    divider: '1px solid #F3F4F6',
    radius: '6px',
  },

  radius: {
    sm: '4px',
    md: '6px',
    lg: '10px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
  },

  stamp: {
    fg: '#6B7280',
    bg: 'transparent',
    border: '#D2D6DC',
  },

  texture: {
    type: 'none',
    value: '',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'bg-fill',
      activeStyle: {
        bgColor: 'rgba(37,99,235,0.08)',
        textColor: '#2563EB',
      },
    },
    button: {
      style: 'fill',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
