import { ThemeConfig } from './types';

export const graffiti: ThemeConfig = {
  id: 'graffiti',
  name: '90s Street',

  colors: {
    bg: '#2a2d2f',
    bgCard: '#333639',
    bgElevated: '#3c3f42',

    textPrimary: 'rgba(255, 255, 255, 0.92)',
    textSecondary: 'rgba(255, 255, 255, 0.62)',
    textTertiary: 'rgba(255, 255, 255, 0.40)',

    accent: '#E8572A',
    accentSecondary: '#D9534F',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#6FBF73',
    error: '#EF5350',
    warning: '#E6A23C',

    border: '#555555',
    borderSubtle: '#3c3f42',
  },

  fonts: {
    display: "'Permanent Marker', cursive",
    data: "'Caveat', cursive",
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px solid #555555',
    divider: '1px dashed rgba(255, 255, 255, 0.12)',
    radius: '4px',
  },

  texture: {
    type: 'svg',
    value: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        height: '3px',
        transform: 'skewX(-8deg)',
      },
    },
    button: {
      style: 'underline',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
