import { ThemeConfig } from './types';

export const iron: ThemeConfig = {
  id: 'iron',
  name: 'Iron & Chalk',

  colors: {
    bg: '#1c1917',
    bgCard: '#292524',
    bgElevated: '#44403c',

    textPrimary: 'rgba(250, 250, 249, 0.92)',
    textSecondary: 'rgba(250, 250, 249, 0.60)',
    textTertiary: 'rgba(250, 250, 249, 0.38)',

    accent: '#f59e0b',
    accentSecondary: '#d97706',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#84cc16',
    error: '#ef4444',
    warning: '#f59e0b',

    border: '#57534e',
    borderSubtle: '#44403c',
  },

  fonts: {
    display: "'Anton', sans-serif",
    data: "'Barlow Condensed', sans-serif",
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px solid #57534e',
    divider: '1px solid rgba(250, 250, 249, 0.08)',
    radius: '2px',
  },

  texture: {
    type: 'css',
    value: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#f59e0b',
        borderWidth: '3px',
      },
    },
    button: {
      style: 'ghost',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
