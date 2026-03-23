import { ThemeConfig } from './types';

export const notebook: ThemeConfig = {
  id: 'notebook',
  name: "Coach's Notebook",

  colors: {
    // Light theme — cream/warm paper
    bg: '#E8E0D4',             // desk/table surface behind notebook
    bgCard: '#FAF6ED',         // notebook page (warm cream)
    bgElevated: '#FFFFFF',

    // Text: warm browns — 3-tier hierarchy
    textPrimary: '#2C241E',    // near-black warm brown (exercise names, set data)
    textSecondary: '#6B5A4A',  // medium brown (labels, metadata, column headers)
    textTertiary: '#8C7B68',   // receded brown (set numbers, unit labels, inactive)

    accent: '#B5312A',         // coaching red (underlines, active indicators)
    accentSecondary: '#1A6B3C', // dark green (checkmarks, completion)

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#1A9E45',
    error: '#B5312A',
    warning: '#D4880F',

    border: '#D5D0C8',
    borderSubtle: '#E5E0D8',
  },

  fonts: {
    display: "'Caveat', cursive",                        // handwritten — exercise names, titles
    data: "'Caveat', cursive",                           // handwritten — weights, reps, RIR
    body: "'Libre Baskerville', Georgia, serif",         // printed — labels, headers, nav
  },

  borders: {
    card: 'none',              // notebook pages don't have card borders
    divider: '1px solid #D5D0C8',
    radius: '0',
  },

  texture: {
    type: 'css',
    // Ruled notebook lines — horizontal lines every 28px
    value: `
      background-image:
        repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 27px,
          rgba(100,140,180,0.15) 27px,
          rgba(100,140,180,0.15) 28px
        );
      background-position: 0 80px;
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#B5312A',
        borderWidth: '2px',
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
