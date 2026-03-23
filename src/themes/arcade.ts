import { ThemeConfig } from './types';

export const arcade: ThemeConfig = {
  id: 'arcade',
  name: 'Retro Arcade',

  colors: {
    bg: '#0f0f1a',
    bgCard: '#1a1a2e',
    bgElevated: '#252540',

    textPrimary: 'rgba(255, 255, 255, 0.95)',
    textSecondary: 'rgba(255, 255, 255, 0.60)',
    textTertiary: 'rgba(255, 255, 255, 0.35)',

    accent: '#ff2d78',
    accentSecondary: '#00e5ff',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#00ff66',
    error: '#ff2d78',
    warning: '#ffdd00',

    border: '#333355',
    borderSubtle: '#252540',
  },

  fonts: {
    display: "'Press Start 2P', cursive",
    data: "'Space Mono', monospace",
    body: "'Space Mono', monospace",
  },

  borders: {
    card: '2px solid #333355',
    divider: '2px solid #333355',
    radius: '0',
  },

  texture: {
    type: 'none',
    value: '',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'badge-bg',
    },
    nav: {
      activeIndicator: 'bg-fill',
      activeStyle: {
        background: 'rgba(255, 45, 120, 0.20)',
      },
    },
    button: {
      style: 'pixel-border',
    },
    restTimer: {
      style: 'text-countdown',
      glowEffect: true,
    },
  },
};
