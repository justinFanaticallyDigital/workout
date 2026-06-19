import { ThemeConfig } from './types';

/**
 * Default — orphan theme (no prototype counterpart). Stock-dark identity
 * preserved. New fields derived to match the dark-stock palette.
 */
export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default',
  chrome: 'default',
  isDark: true,

  colors: {
    bg: '#1A1A1A',
    bgAlt: '#222222',
    bgCard: '#2E2E2E',
    surface: '#2E2E2E',
    surfaceAlt: '#383838',
    bgElevated: '#434343',
    surfaceRaised: '#434343',

    textPrimary: '#EFEFEF',
    text: '#EFEFEF',
    textSecondary: '#CCCCCC',
    textSec: '#CCCCCC',
    textTertiary: '#B8B8B8',
    textTer: '#B8B8B8',
    textOnAccent: '#1A1A1A',
    textOnBg: '#EFEFEF',
    textOnBgSec: '#CCCCCC',
    textOnBgTer: '#B8B8B8',

    border: '#555555',
    borderFaint: '#3A3A3A',
    borderSubtle: '#3A3A3A',
    borderStrong: '#7A7A7A',

    accent: '#E0E0E0',
    accentSecondary: '#FDCA40',
    accentFg: '#E0E0E0',
    accentFaint: 'rgba(224,224,224,0.10)',
    accentBorder: 'rgba(224,224,224,0.40)',
    accentOnBg: '#E0E0E0',
    accentFaintOnBg: 'rgba(224,224,224,0.10)',
    accentBorderOnBg: 'rgba(224,224,224,0.40)',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#6FBF73',
    successFg: '#82D78C',
    successBg: 'rgba(111,191,115,0.10)',
    successBorder: 'rgba(111,191,115,0.40)',

    error: '#EF5350',
    danger: '#EF5350',
    dangerFg: '#F47A78',
    dangerBg: 'rgba(239,83,80,0.10)',
    dangerBorder: 'rgba(239,83,80,0.40)',

    warning: '#E6A23C',
    warn: '#E6A23C',
    warnFg: '#EEB861',
    warnBg: 'rgba(230,162,60,0.10)',
    warnBorder: 'rgba(230,162,60,0.40)',

    info: '#8CB4DC',
    infoFg: '#8CB4DC',
    infoBg: 'rgba(140,180,220,0.10)',
    infoBorder: 'rgba(140,180,220,0.40)',
  },

  fonts: {
    display: 'system-ui, -apple-system, sans-serif',
    fontDisplay: 'system-ui, -apple-system, sans-serif',
    data: "'Courier New', Courier, monospace",
    fontData: "'Courier New', Courier, monospace",
    body: 'system-ui, -apple-system, sans-serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    fontNumber: "'Courier New', Courier, monospace",
  },

  borders: {
    card: '1px solid rgba(255,255,255,0.08)',
    divider: '1px solid rgba(255,255,255,0.06)',
    radius: '4px',
  },

  radius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
  },

  stamp: {
    fg: '#B8B8B8',
    bg: 'transparent',
    border: '#555555',
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
      activeIndicator: 'underline',
      activeStyle: {
        borderColor: '#E0E0E0',
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
