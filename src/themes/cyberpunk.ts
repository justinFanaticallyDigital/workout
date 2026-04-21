import { ThemeConfig } from './types';

export const cyberpunk: ThemeConfig = {
  id: 'cyberpunk',
  name: 'Dark Future',

  colors: {
    bg: '#08080F',
    bgCard: '#080E15',           // rgba(0,240,255,0.025) composited on bg
    bgElevated: '#081119',       // rgba(0,240,255,0.04) composited on bg

    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.64)',
    textTertiary: 'rgba(255,255,255,0.50)',

    accent: '#00F0FF',           // cyan — the signature color
    accentSecondary: '#FF3068',  // alert red/pink

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#00F0FF',
    error: '#FF3068',
    warning: '#EAB308',

    border: '#07242C',           // rgba(0,240,255,0.12) composited on bg
    borderSubtle: '#08141B',     // rgba(0,240,255,0.05) composited on bg
  },

  fonts: {
    display: "'Space Mono', 'Courier New', monospace",
    data: "'Space Mono', 'Courier New', monospace",
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px solid rgba(0,240,255,0.12)',
    divider: '1px solid rgba(0,240,255,0.07)',
    radius: '0',
  },

  texture: {
    type: 'css',
    // CRT scanlines (3-4px repeat) + faint calibration grid dots
    value: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.012) 3px, rgba(0,240,255,0.012) 4px), radial-gradient(circle, rgba(0,240,255,0.03) 1px, transparent 1px)',
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
