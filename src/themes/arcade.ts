import { ThemeConfig } from './types';

/**
 * Arcade / Retro Arcade — values pulled from theme-bridge.jsx.
 * Notable changes: text became solid #FFFFFF, border tied to pink,
 * borderStrong = cyan secondary signal.
 */
export const arcade: ThemeConfig = {
  id: 'arcade',
  name: 'Retro Arcade',
  chrome: 'arcade',
  isDark: true,

  colors: {
    bg: '#07070F',
    bgAlt: '#0E0E1C',
    bgCard: '#22223A',
    surface: '#22223A',
    surfaceAlt: '#1A1A2E',
    bgElevated: '#2A2A44',
    surfaceRaised: '#2A2A44',

    textPrimary: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#DCD7F0',
    textSec: '#DCD7F0',
    textTertiary: '#A8A3D2',
    textTer: '#A8A3D2',
    textOnAccent: '#07070F',
    textOnBg: '#FFFFFF',
    textOnBgSec: '#DCD7F0',
    textOnBgTer: '#A8A3D2',

    border: '#FF50C8',
    borderFaint: 'rgba(255,80,200,0.30)',
    borderSubtle: 'rgba(255,80,200,0.30)',
    borderStrong: '#00F0FF',

    accent: '#FF50C8',
    accentSecondary: '#FFD700',
    accentFg: '#FF50C8',
    accentFaint: 'rgba(255,80,200,0.15)',
    accentBorder: 'rgba(255,80,200,0.55)',
    accentOnBg: '#FF50C8',
    accentFaintOnBg: 'rgba(255,80,200,0.15)',
    accentBorderOnBg: 'rgba(255,80,200,0.55)',

    push: '#00F0FF',
    pull: '#50FF8C',
    legs: '#FF508C',
    core: '#FFDC3C',

    success: '#32F082',
    successFg: '#50FF8C',
    successBg: 'rgba(50,240,130,0.10)',
    successBorder: '#32F082',

    error: '#FF508C',
    danger: '#FF508C',
    dangerFg: '#FF6EA0',
    dangerBg: 'rgba(255,80,140,0.10)',
    dangerBorder: '#FF508C',

    warning: '#FFDC3C',
    warn: '#FFDC3C',
    warnFg: '#FFEB5A',
    warnBg: 'rgba(255,220,60,0.10)',
    warnBorder: '#FFDC3C',

    info: '#00F0FF',
    infoFg: '#00F0FF',
    infoBg: 'rgba(0,240,255,0.10)',
    infoBorder: '#00F0FF',
  },

  fonts: {
    display: "'Press Start 2P', monospace",
    fontDisplay: "'Press Start 2P', monospace",
    data: "'VT323', monospace",
    fontData: "'VT323', monospace",
    body: "'Pixelify Sans', sans-serif",
    fontBody: "'Pixelify Sans', sans-serif",
    fontNumber: "'VT323', monospace",
  },

  borders: {
    card: '2px solid rgba(255,255,255,0.08)',
    divider: '2px solid rgba(255,255,255,0.06)',
    radius: '0',
  },

  radius: {
    sm: '0',
    md: '0',
    lg: '0',
  },

  shadows: {
    sm: '2px 2px 0 rgba(0,240,255,0.5)',
    md: '4px 4px 0 rgba(255,80,200,0.35)',
  },

  stamp: {
    fg: '#00F0FF',
    bg: 'transparent',
    border: '#00F0FF',
  },

  texture: {
    type: 'css',
    value: `
      background-image:
        repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.035) 2px, rgba(255,255,255,0.035) 3px),
        repeating-linear-gradient(90deg, rgba(255,80,200,0.025) 0, rgba(255,80,200,0.025) 1px, transparent 1px, transparent 3px);
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        borderColor: '#FF50C8',
        borderWidth: '2px',
      },
    },
    button: {
      style: 'pixel-border',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
