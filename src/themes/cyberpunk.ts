import { ThemeConfig } from './types';

/**
 * Cyberpunk / Dark Future — values pulled from theme-bridge.jsx.
 * Notable changes: text became solid #EBFAFF (was alpha-white),
 * border tied to cyan accent, fontBody → Share Tech Mono.
 */
export const cyberpunk: ThemeConfig = {
  id: 'cyberpunk',
  name: 'Dark Future',
  chrome: 'cyberpunk',
  isDark: true,

  colors: {
    bg: '#050A16',
    bgAlt: '#0C1426',
    bgCard: '#121E34',
    surface: '#121E34',
    surfaceAlt: '#0E1828',
    bgElevated: '#1A2A4A',
    surfaceRaised: '#1A2A4A',

    textPrimary: '#EBFAFF',
    text: '#EBFAFF',
    textSecondary: '#C8E6F5',
    textSec: '#C8E6F5',
    textTertiary: '#90B0C8',
    textTer: '#90B0C8',
    textOnAccent: '#050A16',
    textOnBg: '#EBFAFF',
    textOnBgSec: '#C8E6F5',
    textOnBgTer: '#90B0C8',

    border: 'rgba(0,240,255,0.35)',
    borderFaint: 'rgba(0,240,255,0.15)',
    borderSubtle: 'rgba(0,240,255,0.15)',
    borderStrong: '#00F0FF',

    accent: '#00F0FF',
    accentSecondary: '#FF3068',
    accentFg: '#00F0FF',
    accentFaint: 'rgba(0,240,255,0.12)',
    accentBorder: 'rgba(0,240,255,0.5)',

    push: '#00F0FF',
    pull: '#7DFFB8',
    legs: '#FF8AA2',
    core: '#FFD050',

    success: '#50F0A0',
    successFg: '#7DFFB8',
    successBg: 'rgba(80,240,160,0.10)',
    successBorder: 'rgba(80,240,160,0.4)',

    error: '#FF5878',
    danger: '#FF5878',
    dangerFg: '#FF8AA2',
    dangerBg: 'rgba(255,88,120,0.10)',
    dangerBorder: 'rgba(255,88,120,0.4)',

    warning: '#FFD050',
    warn: '#FFD050',
    warnFg: '#FFE078',
    warnBg: 'rgba(255,208,80,0.10)',
    warnBorder: 'rgba(255,208,80,0.4)',

    info: '#00F0FF',
    infoFg: '#00F0FF',
    infoBg: 'rgba(0,240,255,0.12)',
    infoBorder: 'rgba(0,240,255,0.5)',
  },

  fonts: {
    display: "'Orbitron', sans-serif",
    fontDisplay: "'Orbitron', sans-serif",
    data: "'Share Tech Mono', monospace",
    fontData: "'Share Tech Mono', monospace",
    body: "'Share Tech Mono', monospace",
    fontBody: "'Share Tech Mono', monospace",
    fontNumber: "'Share Tech Mono', monospace",
  },

  borders: {
    card: '1px solid rgba(0,240,255,0.12)',
    divider: '1px solid rgba(0,240,255,0.07)',
    radius: '0',
  },

  radius: {
    sm: '0',
    md: '0',
    lg: '2px',
  },

  shadows: {
    sm: '0 0 6px rgba(0,240,255,0.25)',
    md: '0 0 20px rgba(0,240,255,0.18)',
  },

  stamp: {
    fg: '#00F0FF',
    bg: 'transparent',
    border: 'rgba(0,240,255,0.5)',
  },

  texture: {
    type: 'css',
    value: `
      background-image:
        repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,240,255,0.025) 2px, rgba(0,240,255,0.025) 3px),
        radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,240,255,0.08) 0%, transparent 70%),
        radial-gradient(circle, rgba(0,240,255,0.04) 1px, transparent 1px);
      background-size: auto, auto, 24px 24px;
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'glow-dot',
      activeStyle: {
        dotSize: '3px',
        glowRadius: '4px',
        color: '#00F0FF',
      },
    },
    button: {
      style: 'ghost',
    },
    restTimer: {
      style: 'bar',
      glowEffect: true,
    },
  },
};
