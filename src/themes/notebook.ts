import { ThemeConfig } from './types';

export const notebook: ThemeConfig = {
  id: 'notebook',
  name: "Coach's Notebook",

  colors: {
    bg: '#f5f0e8',
    bgCard: '#fffdf7',
    bgElevated: '#ffffff',

    textPrimary: 'rgba(30, 25, 20, 0.90)',
    textSecondary: 'rgba(30, 25, 20, 0.60)',
    textTertiary: 'rgba(30, 25, 20, 0.38)',

    accent: '#c0392b',
    accentSecondary: '#2471a3',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#27ae60',
    error: '#c0392b',
    warning: '#d4a017',

    border: '#d5cfc3',
    borderSubtle: '#e8e2d6',
  },

  fonts: {
    display: "'Libre Baskerville', serif",
    data: "'Caveat', cursive",
    body: "'Inter', sans-serif",
  },

  borders: {
    card: '1px solid #d5cfc3',
    divider: '1px solid rgba(30, 25, 20, 0.10)',
    radius: '0',
  },

  texture: {
    type: 'css',
    value: 'repeating-linear-gradient(transparent, transparent 27px, rgba(0, 100, 200, 0.08) 27px, rgba(0, 100, 200, 0.08) 28px)',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        borderBottom: '2px solid #c0392b',
      },
    },
    button: {
      style: 'outline',
    },
    restTimer: {
      style: 'text-countdown',
      glowEffect: false,
    },
  },
};
