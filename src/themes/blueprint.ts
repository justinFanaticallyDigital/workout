import { ThemeConfig } from './types';

export const blueprint: ThemeConfig = {
  id: 'blueprint',
  name: 'Blueprint',

  colors: {
    bg: '#0d2137',
    bgCard: '#122b47',
    bgElevated: '#1a3557',

    textPrimary: 'rgba(200, 220, 255, 0.90)',
    textSecondary: 'rgba(200, 220, 255, 0.58)',
    textTertiary: 'rgba(200, 220, 255, 0.35)',

    accent: '#4a9eff',
    accentSecondary: '#ff6b35',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',

    border: '#1e4a7a',
    borderSubtle: '#162f50',
  },

  fonts: {
    display: "'IBM Plex Mono', monospace",
    data: "'IBM Plex Mono', monospace",
    body: "'IBM Plex Mono', monospace",
  },

  borders: {
    card: '1px solid #1e4a7a',
    divider: '1px solid rgba(74, 158, 255, 0.20)',
    radius: '0',
  },

  texture: {
    type: 'css',
    value: 'linear-gradient(rgba(74, 158, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 158, 255, 0.03) 1px, transparent 1px)',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'border',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#4a9eff',
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
