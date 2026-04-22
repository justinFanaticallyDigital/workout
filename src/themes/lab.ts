import { ThemeConfig } from './types';

export const lab: ThemeConfig = {
  id: 'lab',
  name: 'Lab Report',

  colors: {
    // Clean clinical white/gray — bg darkened so white cards stand out clearly
    bg: '#ECEDF0',
    bgCard: '#FFFFFF',
    bgElevated: '#FFFFFF',

    // Text: dark grays — clinical precision (AA-tuned)
    textPrimary: '#1A1A1A',
    textSecondary: '#555C68',
    textTertiary: '#595F6B',

    accent: '#2563EB',          // clinical blue — data highlights, active states
    accentSecondary: '#059669', // clinical green — success, completion

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',

    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
  },

  fonts: {
    display: "'Inter', sans-serif",
    data: "'Inter', sans-serif",         // clean, precise numbers
    body: "'Inter', sans-serif",         // everything in Inter — clinical uniformity
  },

  borders: {
    card: '1px solid #E5E7EB',
    divider: '1px solid #F3F4F6',
    radius: '6px',  // slight rounding — medical UI feel
  },

  texture: {
    type: 'none',
    value: '',  // no texture — clinical environments are clean
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'bg-fill',
      activeStyle: {
        bgColor: 'rgba(37,99,235,0.08)',
        textColor: '#2563EB',
      },
    },
    button: {
      style: 'fill',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
