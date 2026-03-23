import { ThemeConfig } from './types';

export const cyberpunk: ThemeConfig = {
  id: 'cyberpunk',
  name: 'Dark Future',

  colors: {
    bg: '#0a0a0f',
    bgCard: '#12121a',
    bgElevated: '#1a1a25',

    textPrimary: 'rgba(224, 240, 255, 0.95)',
    textSecondary: 'rgba(224, 240, 255, 0.60)',
    textTertiary: 'rgba(224, 240, 255, 0.35)',

    accent: '#00f0ff',
    accentSecondary: '#ff00aa',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#00ff88',
    error: '#ff3366',
    warning: '#ffaa00',

    border: '#2a2a3a',
    borderSubtle: '#1a1a25',
  },

  fonts: {
    display: "'Space Mono', monospace",
    data: "'Space Mono', monospace",
    body: "'Inter', sans-serif",
  },

  borders: {
    card: '1px solid #2a2a3a',
    divider: '1px solid rgba(0, 240, 255, 0.15)',
    radius: '2px',
  },

  texture: {
    type: 'css',
    value: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.03) 2px, rgba(0, 240, 255, 0.03) 4px)',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '2px',
    },
    nav: {
      activeIndicator: 'glow-dot',
      activeStyle: {
        boxShadow: '0 0 8px #00f0ff',
      },
    },
    button: {
      style: 'outline',
    },
    restTimer: {
      style: 'radial',
      glowEffect: true,
    },
  },
};
