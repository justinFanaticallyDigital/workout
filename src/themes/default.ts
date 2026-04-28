import { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default',

  colors: {
    bg: '#1A1A1A',
    bgCard: '#2E2E2E',
    bgElevated: '#434343',

    textPrimary: '#EFEFEF',
    textSecondary: '#CCCCCC',
    textTertiary: '#B8B8B8',

    accent: '#E0E0E0',
    accentSecondary: '#FDCA40',

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#6FBF73',
    error: '#EF5350',
    warning: '#E6A23C',

    border: '#555555',
    borderSubtle: '#3A3A3A',
  },

  fonts: {
    display: 'system-ui, -apple-system, sans-serif',
    data: "'Courier New', Courier, monospace",
    body: 'system-ui, -apple-system, sans-serif',
  },

  borders: {
    card: '1px solid rgba(255,255,255,0.08)',
    divider: '1px solid rgba(255,255,255,0.06)',
    radius: '4px',
  },

  texture: {
    type: 'none',
    value: '',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        borderColor: '#E0E0E0',
        borderWidth: '2px',
      },
    },
    button: {
      style: 'outline',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
