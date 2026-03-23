import { ThemeConfig } from './types';

export const lab: ThemeConfig = {
  id: 'lab',
  name: 'Lab Report',

  colors: {
    bg: '#f8f9fa',
    bgCard: '#ffffff',
    bgElevated: '#ffffff',

    textPrimary: 'rgba(17, 24, 39, 0.92)',
    textSecondary: 'rgba(17, 24, 39, 0.58)',
    textTertiary: 'rgba(17, 24, 39, 0.35)',

    accent: '#2563eb',
    accentSecondary: '#7c3aed',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#16a34a',
    error: '#dc2626',
    warning: '#ca8a04',

    border: '#e5e7eb',
    borderSubtle: '#f3f4f6',
  },

  fonts: {
    display: "'Inter', sans-serif",
    data: "'IBM Plex Mono', monospace",
    body: "'Inter', sans-serif",
  },

  borders: {
    card: '1px solid #e5e7eb',
    divider: '1px solid #f3f4f6',
    radius: '8px',
  },

  texture: {
    type: 'none',
    value: '',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'top-bar',
    },
    nav: {
      activeIndicator: 'bg-fill',
      activeStyle: {
        background: 'rgba(37, 99, 235, 0.10)',
        borderRadius: '8px',
      },
    },
    button: {
      style: 'fill',
    },
    restTimer: {
      style: 'radial',
      glowEffect: false,
    },
  },
};
